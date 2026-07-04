import os
import requests
from dotenv import load_dotenv

# .env requirements:
# - OMDB_API_KEY: Your API Key from OMDb API (http://www.omdbapi.com).
load_dotenv()
api_key = os.getenv("OMDB_API_KEY")

try:
    # Search for movies with keyword "batman"
    search_res = requests.get(f"http://www.omdbapi.com/?apikey={api_key}&s=batman", timeout=10).json()
    if search_res.get("Response") == "False":
        print(f"ERROR Search: {search_res.get('Error')}")
    else:
        results = [(m.get("Title"), m.get("Year"), m.get("Poster")) for m in search_res.get("Search", [])[:3]]
        print(f"SUCCESS: OMDb Search Results: {results}")

    # Get specific movie details for "Inception"
    movie_res = requests.get(f"http://www.omdbapi.com/?apikey={api_key}&t=Inception", timeout=10).json()
    if movie_res.get("Response") == "False":
        print(f"ERROR Get: {movie_res.get('Error')}")
    else:
        print(f"SUCCESS: Title={movie_res.get('Title')}, Rating={movie_res.get('imdbRating')}, Genre={movie_res.get('Genre')}, Poster={movie_res.get('Poster')}")
except Exception as e:
    print(f"ERROR: OMDb request failed. details: {e}")
