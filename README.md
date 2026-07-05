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

### 1. Setup Environment
Copy `.env.example` to `.env` and fill in your API credentials:
```bash
cp pulsefeed/.env.example pulsefeed/.env
```

### 2. Backend Installation & Run
Install python dependencies:
```bash
pip install -r pulsefeed/requirements.txt
```

Run backend connectivity checks:
```bash
python pulsefeed/tests/test_firestore.py
python pulsefeed/tests/test_omdb.py
python pulsefeed/tests/test_weather.py
python pulsefeed/tests/test_gemini.py
python pulsefeed/tests/test_gemini_fallback.py
```

Start the FastAPI backend server (runs on `http://127.0.0.1:8000`):
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

---

### 3. Frontend Selection (React or Streamlit)

#### Option A: Premium React UI (Recommended)
This features a pixel-perfect, animated dark-mode landing page powered by Vite, Tailwind CSS v4, and Framer Motion. It links directly to the FastAPI server for live search and feed refresh.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development server (runs locally on `http://localhost:5173`):
   ```bash
   npm run dev
   ```

#### Option B: Minimalist Streamlit Interface
A simple, Python-native Streamlit dashboard displaying visual insight grids.

Start the Streamlit application (runs locally on `http://localhost:8501`):
```bash
python -m streamlit run app.py --server.headless=true
```
