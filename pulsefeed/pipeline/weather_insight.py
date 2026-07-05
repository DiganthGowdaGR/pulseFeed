import os
import sys
import json
import datetime
import requests
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from dotenv import load_dotenv

# Add current folder to sys.path to allow running directly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from common import save_insight_to_firestore
from gemini_client import call_gemini

load_dotenv()

# Define schema for Gemini structured output
class DataPoint(BaseModel):
    label: str = Field(description="The city name")
    value: float = Field(description="The temperature as a float in Celsius")
    image_url: Optional[str] = Field(None, description="Always null for weather insights")

class WeatherInsightSchema(BaseModel):
    domain: str = "weather"
    query: Optional[str] = None
    chart_type: Literal["comparison_bar", "trend_line", "text_only"] = "comparison_bar"
    caption: str = Field(description="Comparison caption citing specific numbers (temperatures, humidity, etc.) from the weather data")
    confidence: Literal["high", "medium", "low"] = Field(description="high if data is complete, low if any data was missing")
    data_points: List[DataPoint]
    sources: List[str] = ["Weather API"]
    search_suggestions_html: Optional[str] = None
    generated_via: Literal["structured_api", "grounded_search"] = "structured_api"

def fetch_rain_probability(city: str) -> float | None:
    api_key = os.getenv("WEATHER_API_KEY")
    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        res.encoding = 'utf-8'
        data = res.json()
        
        today_str = datetime.datetime.now().strftime("%Y-%m-%d")
        pops = []
        considered = []
        for entry in data.get("list", []):
            dt_txt = entry.get("dt_txt", "")
            if dt_txt.startswith(today_str):
                dt = entry.get("dt")
                pop = entry.get("pop")
                if pop is not None:
                    pops.append(float(pop))
                    considered.append((dt, dt_txt, pop))
        
        print(f"DEBUG Rain Forecast: {city} (Today={today_str}) -> Considered entries (timestamp, date, pop): {considered}")
        
        if pops:
            return max(pops) * 100.0
        else:
            print(f"WARNING: No forecast entries matching today's date ({today_str}) for '{city}'.")
            return None
    except Exception as e:
        print(f"WARNING: Failed to fetch rain probability for '{city}': {e}")
        return None

def fetch_weather_data(cities: list[str]) -> list[dict]:
    api_key = os.getenv("WEATHER_API_KEY")
    weather_list = []
    for city in cities:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
            res = requests.get(url, timeout=10)
            res.raise_for_status()
            res.encoding = 'utf-8'
            data = res.json()
            
            temp = float(data["main"]["temp"])
            humidity = int(data["main"]["humidity"])
            condition = data["weather"][0]["description"]
            
            # Fetch rain probability for today
            rain_prob = fetch_rain_probability(city)
            
            weather_list.append({
                "city": city,
                "temperature": temp,
                "condition": condition,
                "humidity": humidity,
                "rain_probability": rain_prob
            })
        except Exception as e:
            print(f"WARNING: Weather fetch failed for '{city}': {e}")
    return weather_list

def generate_comparison_insight(weather_data: list[dict]) -> dict:
    print(f"Raw weather data before sending to Gemini: {weather_data}")
    prompt = (
        f"Compare the weather conditions across these cities: {json.dumps(weather_data)}.\n"
        "Draft a 1-2 sentence comparison caption citing specific temperatures, humidity, and rain probabilities (as percentage e.g., 70%) from the dataset.\n"
        "Format temperatures clearly as 'X.X°C' (e.g., 23.0°C) without any newlines or encoding artifacts.\n"
        "Always set the 'sources' field to exactly ['Weather API']."
    )
    insight_json = call_gemini(
        prompt=prompt,
        use_search_grounding=False,
        response_schema=WeatherInsightSchema
    )
    if "error" in insight_json:
        raise Exception(f"Gemini call failed: {insight_json['error']}")
        
    # Robustly clean up any remaining encoding or newline corruption in the caption
    if "caption" in insight_json and isinstance(insight_json["caption"], str):
        caption = insight_json["caption"]
        caption = caption.replace("\n\u00b0", "°").replace("\nA\u00b0", "°").replace("\n°", "°").replace("Â°", "°")
        insight_json["caption"] = caption
        
    return insight_json

if __name__ == "__main__":
    print("Fetching weather data...")
    fetched_weather = fetch_weather_data(["Bangalore", "Mumbai", "Delhi"])
    print(f"Fetched weather data: {json.dumps(fetched_weather, indent=2)}")
    
    print("Generating comparison insight...")
    insight_json = generate_comparison_insight(fetched_weather)
    print(f"Generated Insight:\n{json.dumps(insight_json, indent=2)}")
    
    print("Saving insight to Firestore...")
    doc_id = save_insight_to_firestore(insight_json, "weather")
    print(f"Done — insight saved with ID: {doc_id}")
