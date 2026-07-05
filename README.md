# PulseFeed — AI-Generated Visual Insights

PulseFeed is an automated data gathering, analysis, and visual presentation system. It parses queries (e.g. comparing weather, movies, financial data, or open-ended topics), cross-references multiple live sources, and renders premium visual insights in a modular dashboard.

---

## 🚀 Key Features

1. **Access Gate & Privacy**: Gated evaluation portal with a secure, timing-safe HMAC token validator (`PULSEFEED_ACCESS_CODE`) and rate limiting (10 attempts per hour).
2. **Waitlist Integration**: Visitor signup pipeline stored directly in a Supabase table with Row-Level Security (RLS) policies.
3. **Structured API pipeline**: Uses Gemini 2.5 Flash with strict `pydantic` schemas for guaranteed JSON outputs (chart type, confidence scores, verified citations).
4. **Historical Insights Library**: Persistent Firestore archiving allows reviewing previously generated query insights.

---

## 📁 Repository Structure

```text
├── backend/
│   └── main.py             # FastAPI App containing API endpoints and rate limiters
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Landing page, Access Gate modal, & Dashboard logic
│   │   └── main.jsx        # App entry point
│   ├── vite.config.js      # Dev proxy configuration
│   └── package.json        # Frontend Node project files
├── pulsefeed/
│   ├── .env                # Local secrets and keys (not committed)
│   ├── pipeline/
│   │   ├── common.py       # Firestore integration logic
│   │   ├── search_insight.py # Multi-source grounding engine
│   │   └── run_all.py      # Scheduled batch crawler
│   └── tests/              # Individual service connectivity tests
├── api/
│   ├── index.py            # Vercel serverless function entrypoint
│   └── requirements.txt    # Vercel serverless function dependencies
├── Dockerfile              # Monorepo multi-stage build script
├── vercel.json             # Vercel routing and frontend builder configuration
├── requirements.txt        # Root level Python backend requirements
└── supabase_setup.sql      # Supabase waitlist table creation and RLS setup
```

---

## 🛠️ Getting Started

### 1. Setup Environment
Create a `.env` file inside `pulsefeed/` using the following keys:
```ini
# Firebase Firestore Configuration
FIRESTORE_PROJECT_ID="your-project-id"
GOOGLE_APPLICATION_CREDENTIALS="YOUR FILE PATH HERE"

# API keys
OMDB_API_KEY="your-omdb-key"
WEATHER_API_KEY="your-openweathermap-key"
GEMINI_API_KEY="your-gemini-api-key"

# Supabase Waitlist Database (Rest API client)
SUPABASE_URL="YOUR URL HERE"
SUPABASE_ANON_KEY="your-anon-public-key"

# Secure Evaluation Gate Access Code
PULSEFEED_ACCESS_CODE="SECRETE-KEY"
ACCESS_GATE_MAX_ATTEMPTS=10
```

### 2. Supabase Table Setup
Run the SQL queries from [supabase_setup.sql](file:///c:/Users/deeks/OneDrive/Documents/NewFetcher/supabase_setup.sql) in your Supabase SQL Editor. This initializes the `waitlist` table and enforces Row-Level Security (RLS) to protect user signups.

### 3. Local Development

#### Start Backend API Server
Install dependencies and run FastAPI on port 8000:
```bash
pip install -r requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Start Frontend Client
In a separate terminal, install npm dependencies and run the Vite server:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Production Deployment

### Option A: Docker Deployment (Single Container)
Builds both React and FastAPI apps and serves them from a single high-performance port:
```bash
# Build the unified container
docker build -t pulsefeed .

# Run the container (ensure env variables are passed)
docker run -p 8000:8000 --env-file pulsefeed/.env pulsefeed
```
Your application will be live on `http://localhost:8000`.

### Option B: Vercel Deployment
Deploy the entire monorepo with one click on Vercel:
1. Connect this repository to Vercel.
2. The `vercel.json` config will automatically build the React assets and map `/api/*` to the Python serverless function at `/api/index.py`.
3. Add the `.env` keys under **Vercel Project Settings > Environment Variables**.
