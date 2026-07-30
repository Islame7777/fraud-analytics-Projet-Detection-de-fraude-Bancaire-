# chatbot.py
import requests
import json

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "llama3.2"

def call_ollama(messages):
    response = requests.post(OLLAMA_URL, json={
        "model": MODEL,
        "messages": messages,
        "stream": False
    })
    return response.json()["message"]["content"]

# ─── AGENT 1 : Analyste de transaction ───
def agent_analyste(transaction: dict) -> str:
    messages = [
        {
            "role": "system",
            "content": """Tu es un analyste bancaire expert en détection de fraude.
Tu analyses les caractéristiques d'une transaction et identifies les signaux suspects.
Réponds en français de manière concise."""
        },
        {
            "role": "user",
            "content": f"""Analyse cette transaction bancaire et identifie les signaux suspects :
- Type : {transaction.get('type', 'TRANSFER')}
- Montant : {transaction.get('amount', 0)} MAD
- Ancien solde origine : {transaction.get('oldbalanceOrg', 0)} MAD
- Nouveau solde origine : {transaction.get('newbalanceOrig', 0)} MAD
- Ancien solde destination : {transaction.get('oldbalanceDest', 0)} MAD
- Nouveau solde destination : {transaction.get('newbalanceDest', 0)} MAD

Identifie les anomalies et signaux suspects."""
        }
    ]
    return call_ollama(messages)

# ─── AGENT 2 : Évaluateur de risque ───
def agent_evaluateur(analyse: str, transaction: dict) -> str:
    messages = [
        {
            "role": "system",
            "content": """Tu es un expert en évaluation du risque de fraude bancaire.
Sur la base d'une analyse, tu donnes un score de risque entre 0 et 100 et une explication.
Réponds en français avec le format :
SCORE: [nombre]
NIVEAU: [FAIBLE/MOYEN/ÉLEVÉ/CRITIQUE]
EXPLICATION: [explication courte]"""
        },
        {
            "role": "user",
            "content": f"""Sur la base de cette analyse :
{analyse}

Pour une transaction de type {transaction.get('type')} avec un montant de {transaction.get('amount')} MAD,
donne un score de risque et une explication."""
        }
    ]
    return call_ollama(messages)

# ─── AGENT 3 : Décideur ───
def agent_decideur(evaluation: str, prediction_modele: int) -> str:
    messages = [
        {
            "role": "system",
            "content": """Tu es un décideur bancaire responsable de la validation des transactions.
Tu reçois une évaluation de risque et la prédiction d'un modèle IA.
Tu recommandes une action finale claire.
Réponds en français avec le format :
DÉCISION: [BLOQUER/SURVEILLER/VALIDER]
RAISON: [raison courte]
ACTION: [action concrète à prendre]"""
        },
        {
            "role": "user",
            "content": f"""Évaluation de risque :
{evaluation}

Prédiction du modèle IA : {'FRAUDE DÉTECTÉE' if prediction_modele == 1 else 'TRANSACTION NORMALE'}

Quelle est ta décision finale ?"""
        }
    ]
    return call_ollama(messages)

# ─── ORCHESTRATEUR MULTIAGENT ───
def analyser_transaction_multiagent(transaction: dict, prediction_modele: int) -> dict:
    print("🤖 Agent 1 — Analyse en cours...")
    analyse = agent_analyste(transaction)
    
    print("🤖 Agent 2 — Évaluation du risque...")
    evaluation = agent_evaluateur(analyse, transaction)
    
    print("🤖 Agent 3 — Décision finale...")
    decision = agent_decideur(evaluation, prediction_modele)
    
    return {
        "analyse": analyse,
        "evaluation": evaluation,
        "decision": decision
    }

# ─── CHATBOT CONVERSATIONNEL ───
def chatbot_conversation(user_message: str, historique: list) -> str:
    historique.append({
        "role": "user",
        "content": user_message
    })
    
    system = {
        "role": "system",
        "content": """Tu es FraudBot, un assistant expert en détection de fraude bancaire.
Tu aides les utilisateurs à comprendre les fraudes, analyser des transactions suspectes,
et interpréter les résultats du modèle de Machine Learning.
Tu réponds toujours en français de manière claire et professionnelle.
Tu connais ces statistiques : 6,362,620 transactions analysées, 8,213 fraudes (0.13%),
modèle Random Forest avec ROC-AUC 0.9997, SMOTE pour équilibrer les classes."""
    }
    
    messages = [system] + historique
    response = call_ollama(messages)
    
    historique.append({
        "role": "assistant",
        "content": response
    })
    
    return response

if __name__ == "__main__":
    # Test rapide
    print("Test du chatbot multiagent...")
    transaction_test = {
        "type": "TRANSFER",
        "amount": 181480,
        "oldbalanceOrg": 181480,
        "newbalanceOrig": 0,
        "oldbalanceDest": 0,
        "newbalanceDest": 181480
    }
    
    resultat = analyser_transaction_multiagent(transaction_test, prediction_modele=1)
    print("\n=== ANALYSE ===")
    print(resultat["analyse"])
    print("\n=== ÉVALUATION ===")
    print(resultat["evaluation"])
    print("\n=== DÉCISION ===")
    print(resultat["decision"])