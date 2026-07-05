import os
import sys
import json
import requests
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from dotenv import load_dotenv

# Add parent directory to sys.path to allow running directly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from common import save_insight_to_firestore
from gemini_client import call_gemini

load_dotenv()

# Define schema for Gemini structured output
class DataPoint(BaseModel):
    label: str = Field(description="The movie title")
    value: float = Field(description="The IMDb rating as a float")
    image_url: str = Field(description="The movie poster URL")

class MovieInsightSchema(BaseModel):
    domain: str = "movies"
    query: Optional[str] = None
    chart_type: Literal["comparison_bar", "trend_line", "text_only"] = "comparison_bar"
    caption: str = Field(description="A 1-2 sentence caption comparing the movies (e.g., ratings, genre)")
    confidence: Literal["high", "medium", "low"] = Field(description="high if data is complete, low if any data was missing")
    data_points: List[DataPoint]
    sources: List[str] = ["OMDb API"]
    search_suggestions_html: Optional[str] = None
    generated_via: Literal["structured_api", "grounded_search"] = "structured_api"

def fetch_movie_data(titles: list[str]) -> list[dict]:
    api_key = os.getenv("OMDB_API_KEY")
    movie_list = []
    for title in titles:
        try:
            url = f"http://www.omdbapi.com/?apikey={api_key}&t={title}"
            res = requests.get(url, timeout=10).json()
            if res.get("Response") == "False":
                print(f"WARNING: Movie '{title}' not found: {res.get('Error')}")
                continue
            
            try:
                imdb_rating = float(res.get("imdbRating", 0.0))
            except ValueError:
                imdb_rating = 0.0

            movie_list.append({
                "title": res.get("Title"),
                "year": res.get("Year"),
                "imdb_rating": imdb_rating,
                "genre": res.get("Genre"),
                "poster_url": res.get("Poster")
            })
        except Exception as e:
            print(f"WARNING: Request failed for '{title}': {e}")
    return movie_list

def generate_comparison_insight(movies: list[dict]) -> dict:
    prompt = (
        f"Compare the following movies based on their ratings and genres: {json.dumps(movies)}.\n"
        "Analyze the details to generate a 1-2 sentence comparison caption."
    )
    result = call_gemini(
        prompt=prompt,
        use_search_grounding=False,
        response_schema=MovieInsightSchema
    )
    if "error" in result:
        raise Exception(f"Gemini call failed: {result['error']}")
    return result


if __name__ == "__main__":
    print("Fetching movie data...")
    fetched_movies = fetch_movie_data(["Inception", "Interstellar", "Tenet"])
    
    print("Generating comparison insight...")
    insight_json = generate_comparison_insight(fetched_movies)
    print(f"Generated Insight:\n{json.dumps(insight_json, indent=2)}")
    
    print("Saving insight to Firestore...")
    doc_id = save_insight_to_firestore(insight_json, "movies")
    print(f"Done — insight saved with ID: {doc_id}")
