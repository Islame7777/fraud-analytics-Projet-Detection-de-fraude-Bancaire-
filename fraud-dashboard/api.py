# api.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import joblib
import os
import sys
import random

# ─── Charger le modèle ───
BASE_DIR = os.path.dirname(__file__)
model_path = os.path.join(BASE_DIR, "..", "rf_model_balanced.pkl")
rf_model = joblib.load(model_path)

# ─── Permettre l'import de chatbot.py situé dans le dossier parent ───
sys.path.append(os.path.join(BASE_DIR, ".."))
from chatbot import chatbot_conversation

# ─── Initialiser FastAPI ───
app = FastAPI(title="Fraud Detection API")

# ─── Autoriser le frontend (CORS) ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schéma des données de transaction ───
class Transaction(BaseModel):
    step: int
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float
    type_CASH_OUT: int
    type_DEBIT: int
    type_PAYMENT: int
    type_TRANSFER: int
    ratio_amount: float = 0.0
    user_email: Optional[str] = "anonymous@bancaire.ma"

# ─── Schéma du chat ───
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = "default"

# ─── Stockage en mémoire de l'historique (perdu au redémarrage du serveur) ───
HISTORIQUE: dict[str, list] = {}

# ─── Stockage en mémoire des sessions de chat ───
SESSIONS_CHAT: dict[str, list] = {}

# ─── Route racine ───
@app.get("/")
def home():
    return {"message": "API Fraud Detection est en ligne ! Utilisez /predict en POST."}

# ─── Endpoint prédiction ───
@app.post("/predict")
def predict(transaction: Transaction):
    try:
        data = transaction.dict()
        email = data.pop("user_email", "anonymous@bancaire.ma")

        df = pd.DataFrame([data])
        if "ratio_amount" in df.columns:
            df = df.drop(columns=["ratio_amount"])

        pred = rf_model.predict(df)[0]

        # Déterminer le type de transaction lisible
        type_map = {"type_CASH_OUT": "CASH_OUT", "type_DEBIT": "DEBIT",
                    "type_PAYMENT": "PAYMENT", "type_TRANSFER": "TRANSFER"}
        type_label = next((v for k, v in type_map.items() if data.get(k) == 1), "INCONNU")

        # Score de risque cohérent avec la prédiction
        risk = random.randint(85, 99) if pred == 1 else random.randint(2, 16)

        entry = {
            "id": f"TX-{len(HISTORIQUE.get(email, [])) + 1:05d}",
            "type": type_label,
            "amount": data["amount"],
            "step": data["step"],
            "risk": risk,
            "status": "Fraude" if pred == 1 else "Normale",
        }
        HISTORIQUE.setdefault(email, []).insert(0, entry)

        return {"prediction": int(pred)}

    except Exception as e:
        return {"error": str(e)}

# ─── Endpoint historique ───
@app.get("/history")
def history(email: str):
    return HISTORIQUE.get(email, [])

# ─── Endpoint chatbot ───
@app.post("/chat")
def chat(payload: ChatMessage):
    try:
        historique = SESSIONS_CHAT.setdefault(payload.session_id, [])
        reponse = chatbot_conversation(payload.message, historique)
        return {"response": reponse}
    except Exception as e:
        return {"response": f"Erreur du chatbot : {str(e)}"}