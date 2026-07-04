import os
from google import genai
from dotenv import load_dotenv

# .env requirements:
# - GEMINI_API_KEY: Your Gemini API Key from Google AI Studio.
load_dotenv()

try:
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Reply with the word: connected"
    )
    print(f"SUCCESS: Gemini connected. Response: {response.text.strip()}")
except Exception as e:
    print(f"ERROR: Gemini connection failed. details: {e}")
