import os
from google.cloud import firestore

def save_insight_to_firestore(insight: dict, domain: str) -> str:
    db = firestore.Client(
        project=os.getenv("FIRESTORE_PROJECT_ID"),
        database=os.getenv("FIRESTORE_DATABASE_ID", "(default)")
    )
    insight_data = dict(insight)
    insight_data["domain"] = domain
    insight_data["timestamp"] = firestore.SERVER_TIMESTAMP
    _, doc_ref = db.collection("insights").add(insight_data)
    print(f"SUCCESS: Saved insight to Firestore. Document ID: {doc_ref.id}")
    return doc_ref.id

def get_all_insights(domain_filter: list[str] = None) -> list[dict]:
    db = firestore.Client(
        project=os.getenv("FIRESTORE_PROJECT_ID"),
        database=os.getenv("FIRESTORE_DATABASE_ID", "(default)")
    )
    query = db.collection("insights").order_by("timestamp", direction=firestore.Query.DESCENDING)
    if domain_filter:
        query = query.where(filter=firestore.FieldFilter("domain", "in", domain_filter))
    
    docs = query.stream()
    insights = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        insights.append(data)
    return insights
