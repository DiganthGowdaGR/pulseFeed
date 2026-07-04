import os
import sys
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure project directories are in sys.path
workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(workspace_root)
sys.path.append(os.path.join(workspace_root, "pulsefeed"))
sys.path.append(os.path.join(workspace_root, "pulsefeed", "pipeline"))

from pulsefeed.pipeline.common import get_all_insights
from pulsefeed.pipeline.search_insight import generate_insight_for_query
from pulsefeed.pipeline.run_all import generate_all_insights

app = FastAPI(title="PulseFeed Backend API")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str

@app.get("/api/insights")
def read_insights(domain: Optional[str] = None):
    try:
        domain_filter = domain.split(",") if domain else None
        insights = get_all_insights(domain_filter=domain_filter)
        return insights
    except Exception as e:
        print(f"Error fetching insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search")
def search_insights(request: SearchRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        insight = generate_insight_for_query(request.query)
        return insight
    except Exception as e:
        print(f"Error during grounded search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
def generate_feed():
    try:
        doc_ids = generate_all_insights()
        return {"status": "success", "generated_count": len(doc_ids), "document_ids": doc_ids}
    except Exception as e:
        print(f"Error generating insights feed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
