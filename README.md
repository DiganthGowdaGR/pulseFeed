# PulseFeed - Backend Services

PulseFeed is an automated insight gathering and analysis pipeline. This repository houses the backend services, connectivity tests, and pipeline scripts responsible for fetching, comparing, and persisting data insights from external APIs using Google Gemini 2.5 Flash.

## Project Structure
```text
pulsefeed/
  .env                  # Local secrets and config (not committed)
  .env.example          # Template configuration
  .gitignore            # Standard git excludes
  requirements.txt      # Project dependencies
  tests/
    test_firestore.py   # Connection check for Firebase Firestore
    test_omdb.py        # Connection check for OMDb movie API
    test_weather.py     # Connection check for OpenWeatherMap API
    test_gemini.py      # Connection check for Gemini API (google-genai SDK)
  pipeline/
    common.py           # Shared Firestore save and query helpers
    movie_insight.py    # OMDb data fetching and Gemini movie comparisons
    weather_insight.py  # OpenWeatherMap data & today's rain probability comparison
    run_all.py          # Complete sequential runner of all insight pipelines
```

## Features Implemented
1. **API Connectivity Checks**: Stanadlone test scripts verifying Firestore, OMDb, OpenWeatherMap, and Gemini SDKs are working.
2. **Structured Gemini Outputs**: Leveraged `pydantic` schemas coupled with the new `google-genai` SDK structured outputs to guarantee API models respond strictly in JSON format.
3. **Weather Forecast Parsing**: Aggregates the maximum precipitation probability (`pop`) for "Today" from 3-hour interval weather forecasts.
4. **Shared Persistence Layer**: Refactored Firestore database collection writes and queries (`save_insight_to_firestore`, `get_all_insights`) into a single, modular `common.py`.
5. **Batch Generation Suite**: `run_all.py` permits running the entire data harvesting and analysis lifecycle in a single execution.

## Getting Started

1. Copy `.env.example` to `.env` and fill in your API credentials:
   ```bash
   cp pulsefeed/.env.example pulsefeed/.env
   ```
2. Install dependencies:
   ```bash
   pip install -r pulsefeed/requirements.txt
   ```
3. Run connectivity checks:
   ```bash
   python pulsefeed/tests/test_firestore.py
   python pulsefeed/tests/test_omdb.py
   python pulsefeed/tests/test_weather.py
   python pulsefeed/tests/test_gemini.py
   ```
4. Run pipeline scripts:
   ```bash
   # Run all pipelines sequentially
   python pulsefeed/pipeline/run_all.py
   ```
