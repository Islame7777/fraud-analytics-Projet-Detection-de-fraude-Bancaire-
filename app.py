from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import joblib
import os
import random  # Importé pour générer des IDs uniques de test
from chatbot import chatbot_conversation, analyser_transaction_multiagent

BASE_DIR = os.path.dirname(__file__)

# Charger modèle, scaler et features
rf_model = joblib.load(os.path.join(BASE_DIR, "rf_model_balanced.pkl"))
scaler   = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
feature_names = joblib.load(os.path.join(BASE_DIR, "feature_names.pkl"))

print("Features attendues:", feature_names)

app = FastAPI(title="Fraud Detection API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── STOCKAGE EN MÉMOIRE DE L'HISTORIQUE ───
historiques = {}
DB_HISTORIQUE = []  # Contiendra toutes les transactions analysées en direct

# ─── MODÈLES PYDANTIC ───
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
    user_email: Optional[str] = "anonymous@bancaire.ma"  # 💥 AJOUT : Reçu depuis ton App.jsx modifié

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = "default"

class TransactionChat(BaseModel):
    transaction: dict
    prediction: int
    session_id: Optional[str] = "default"


# ─── ENDPOINTS ───
@app.get("/")
def root():
    return {"message": "Fraud Detection API is running"}


@app.post("/predict")
def predict(transaction: Transaction):
    try:
        # 1. Construction du DataFrame pour ton modèle Scikit-Learn
        df = pd.DataFrame([{
            'step':           transaction.step,
            'amount':         transaction.amount,
            'oldbalanceOrg':  transaction.oldbalanceOrg,
            'newbalanceOrig': transaction.newbalanceOrig,
            'oldbalanceDest': transaction.oldbalanceDest,
            'newbalanceDest': transaction.newbalanceDest,
            'type_CASH_OUT':  transaction.type_CASH_OUT,
            'type_DEBIT':     transaction.type_DEBIT,
            'type_PAYMENT':   transaction.type_PAYMENT,
            'type_TRANSFER':  transaction.type_TRANSFER
        }])

        # Réalignement des features selon l'entraînement du Random Forest
        df = df[feature_names]

        # Normalisation
        cols_num = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
        df[cols_num] = scaler.transform(df[cols_num])

        # Exécution des prédictions réelles de ton IA
        prediction = rf_model.predict(df)[0]
        proba      = rf_model.predict_proba(df)[0][1]

        # 2. Conversion des types pour l'affichage de l'historique React
        status_label = "Fraude" if int(prediction) == 1 else "Normale"
        risk_score = int(round(float(proba) * 100)) # Utilise la vraie probabilité de ton modèle !

        # Détermination textuelle du type pour le tableau
        tx_type = "PAYMENT"
        if transaction.type_CASH_OUT == 1: tx_type = "CASH_OUT"
        elif transaction.type_TRANSFER == 1: tx_type = "TRANSFER"
        elif transaction.type_DEBIT == 1: tx_type = "DEBIT"

        # 3. Sauvegarde automatique dans l'historique de l'utilisateur
        nouvelle_analyse = {
            "id": f"TXN-{random.randint(1000, 9999)}",
            "type": tx_type,
            "amount": transaction.amount,
            "step": transaction.step,
            "risk": risk_score,
            "status": status_label,
            "user_email": transaction.user_email  # Lié à l'analyste connecté
        }
        DB_HISTORIQUE.append(nouvelle_analyse)

        return {
            "prediction": int(prediction),
            "probability": round(float(proba), 4)
        }

    except Exception as e:
        print("ERREUR:", str(e))
        return {"error": str(e)}


# ─── NOUVEL ENDPOINT : HISTORIQUE CLOISONNÉ ───
@app.get("/history")
def get_history(email: str):
    """ Renvoie les requêtes effectuées uniquement par l'analyste connecté """
    user_history = [tx for tx in DB_HISTORIQUE if tx["user_email"] == email]
    # Du plus récent au plus ancien
    return list(reversed(user_history))


@app.get("/stats")
def stats():
    return {
        "total_transactions": 6362620,
        "total_fraudes": 8213,
        "taux_fraude": 0.00129,
        "roc_auc": 0.9997,
        "recall_fraude": 0.99,
        "modele": "Random Forest",
        "n_estimators": 100
    }

@app.post("/chat")
def chat(msg: ChatMessage):
    try:
        if msg.session_id not in historiques:
            historiques[msg.session_id] = []
        response = chatbot_conversation(msg.message, historiques[msg.session_id])
        return {"response": response}
    except Exception as e:
        print("ERREUR chat:", str(e))
        return {"error": str(e)}

@app.post("/chat/analyser")
def chat_analyser(data: TransactionChat):
    try:
        resultat = analyser_transaction_multiagent(data.transaction, data.prediction)
        return resultat
    except Exception as e:
        print("ERREUR analyse:", str(e))
        return {"error": str(e)}