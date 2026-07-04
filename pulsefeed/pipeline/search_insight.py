import os
import sys
import json
import re
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# Add parent directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from gemini_client import call_gemini
from common import save_insight_to_firestore

# Schema definitions matching Part 1
class DataPoint(BaseModel):
    label: str = Field(description="Display label of the data point")
    value: Optional[float] = Field(None, description="Numeric value as a float, or null if not applicable")
    image_url: Optional[str] = Field(None, description="Optional image URL or null")

class SearchInsightSchema(BaseModel):
    domain: str = Field(description="A short slug derived from the query, e.g., 'job_market_react_developers'")
    query: Optional[str] = Field(None, description="The exact user search text, set to null in model output")
    chart_type: Literal["comparison_bar", "trend_line", "text_only"] = Field(
        description="comparison_bar or trend_line if numeric data is found, otherwise text_only"
    )
    caption: str = Field(description="2-3 sentence caption. MUST cite specific numbers/facts found.")
    confidence: Literal["high", "medium", "low"] = Field(
        description="high if data is complete, medium if partial, low if very limited information is found"
    )
    data_points: List[DataPoint] = Field(
        default_factory=list,
        description="List of extracted data points. Set to empty list if no clean numerical data is available."
    )
    sources: List[str] = Field(default_factory=list, description="Source URLs or names found during search")
    search_suggestions_html: Optional[str] = Field(None, description="Always set to null in model output")
    generated_via: Literal["structured_api", "grounded_search"] = "grounded_search"

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '_', text)
    return text

def generate_insight_for_query(user_query: str) -> dict:
    prompt = f"""
    The user is asking about: '{user_query}'. Search for current, specific, relevant information on exactly this topic — do not give a generic overview.
    
    If the topic involves comparable numeric data (prices, ratings, statistics, counts, percentages), extract 2-4 specific comparable data points.
    
    You MUST output strict JSON matching this schema:
    - domain: A short lowercase slug for the topic.
    - query: Set to null.
    - chart_type: "comparison_bar", "trend_line", or "text_only". Set to "text_only" if no numeric data can be cleanly extracted.
    - caption: A 2-3 sentence summary citing specific numbers and facts found from your search. Do NOT use generic filler.
    - confidence: "high", "medium", or "low". Set to "low" or "medium" if search results are thin or if you cannot verify the facts.
    - data_points: A list of objects with label, value (float or null), and image_url (always null). If data_points cannot be cleanly extracted, return an empty list. Do NOT invent or fabricate fake numbers to fill the list.
    - sources: A list of source names or URLs.
    - search_suggestions_html: Set to null.
    - generated_via: "grounded_search".

    If you cannot find specific, current, relevant information, set confidence to 'low', chart_type to 'text_only', data_points to an empty list, and say so honestly in the caption — do NOT fabricate data to fill the response.
    """
    
    print(f"Generating insight for query: '{user_query}'...")
    insight_json = call_gemini(
        prompt=prompt,
        use_search_grounding=True,
        response_schema=SearchInsightSchema
    )
    
    if "error" in insight_json:
        # Create an error fallback insight matching the schema
        insight_json = {
            "domain": slugify(user_query),
            "query": user_query,
            "chart_type": "text_only",
            "caption": f"Failed to retrieve data for '{user_query}' live via Gemini.",
            "confidence": "low",
            "data_points": [],
            "sources": [],
            "search_suggestions_html": None,
            "generated_via": "grounded_search"
        }
    else:
        # Override query and generated_via fields to guarantee correctness
        insight_json["query"] = user_query
        insight_json["generated_via"] = "grounded_search"
        # Guarantee search_suggestions_html and sources are present
        if "search_suggestions_html" not in insight_json:
            insight_json["search_suggestions_html"] = None
        if "sources" not in insight_json or not insight_json["sources"]:
            insight_json["sources"] = ["Google Search Grounding"]
            
    # Save to Firestore under the query slug domain
    domain_slug = insight_json.get("domain") or slugify(user_query)
    doc_id = save_insight_to_firestore(insight_json, domain_slug)
    insight_json["id"] = doc_id
    
    return insight_json

if __name__ == "__main__":
    test_queries = [
        "React developer job demand in Bangalore 2026",
        "recent Indian startup funding rounds in edtech",
        "best budget noise cancelling headphones under 3000 rupees"
    ]
    
    for q in test_queries:
        print("="*60)
        res = generate_insight_for_query(q)
        print(json.dumps(res, indent=2))
        print("="*60)
