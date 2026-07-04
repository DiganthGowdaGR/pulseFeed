import os
from dotenv import load_dotenv
from google.cloud import firestore

# .env requirements:
# - FIRESTORE_PROJECT_ID: The Google Cloud Project ID for your Firestore instance.
# - FIRESTORE_DATABASE_ID: The Firestore Database ID (e.g. "(default)").
# - GOOGLE_APPLICATION_CREDENTIALS: Path to your Firebase service account JSON key file.
load_dotenv()

project_id = os.getenv("FIRESTORE_PROJECT_ID")
database_id = os.getenv("FIRESTORE_DATABASE_ID", "(default)")
print(f"Testing Firestore connection: Project={project_id}, Database={database_id}")

try:
    db = firestore.Client(project=project_id, database=database_id)
    doc_ref = db.collection("test").document("connectivity_test")
    doc_ref.set({"status": "connected", "message": "PulseFeed connection test successful"})
    
    doc = doc_ref.get()
    if doc.exists:
        print(f"SUCCESS: Firestore connected. Data: {doc.to_dict()}")
        doc_ref.delete()
    else:
        print("ERROR: Firestore document write succeeded but document not found on read.")
except Exception as e:
    print(f"ERROR: Firestore connection failed. details: {e}")
