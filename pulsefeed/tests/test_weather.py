import os
import requests
from dotenv import load_dotenv

# .env requirements:
# - WEATHER_API_KEY: Your API key for OpenWeatherMap (https://openweathermap.org).
load_dotenv()

api_key = os.getenv("WEATHER_API_KEY")
city = "Bangalore"
url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"

try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()
    temp = data["main"]["temp"]
    conditions = data["weather"][0]["description"]
    print(f"SUCCESS: Weather API connected. Current weather in {city}: {temp}°C, {conditions}")
except Exception as e:
    print(f"ERROR: Weather API connection failed. details: {e}")
