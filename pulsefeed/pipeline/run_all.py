import os
import sys

# Add current folder to sys.path to allow running directly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import movie_insight
import weather_insight
from common import save_insight_to_firestore

def generate_all_insights() -> list[str]:
    doc_ids = []
    
    # Run Movie Insight Pipeline
    print("--- Generating Movie Insights ---")
    movies = ["Inception", "Interstellar", "Tenet"]
    movie_data = movie_insight.fetch_movie_data(movies)
    movie_json = movie_insight.generate_comparison_insight(movie_data)
    movie_id = save_insight_to_firestore(movie_json, "movies")
    doc_ids.append(movie_id)
    
    # Run Weather Insight Pipeline
    print("--- Generating Weather Insights ---")
    cities = ["Bangalore", "Mumbai", "Delhi"]
    weather_data = weather_insight.fetch_weather_data(cities)
    weather_json = weather_insight.generate_comparison_insight(weather_data)
    weather_id = save_insight_to_firestore(weather_json, "weather")
    doc_ids.append(weather_id)
    
    return doc_ids

if __name__ == "__main__":
    print("Starting collection of all insights...")
    created_ids = generate_all_insights()
    print(f"Generated 2 insights: {created_ids}")
