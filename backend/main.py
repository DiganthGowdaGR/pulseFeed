import os
import sys
import hmac
import hashlib
import time
from typing import Optional
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

# Ensure project directories are in sys.path
workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(workspace_root)
sys.path.append(os.path.join(workspace_root, "pulsefeed"))
sys.path.append(os.path.join(workspace_root, "pulsefeed", "pipeline"))

from dotenv import load_dotenv
load_dotenv(os.path.join(workspace_root, "pulsefeed", ".env"))

from pulsefeed.pipeline.common import get_all_insights
from pulsefeed.pipeline.search_insight import generate_insight_for_query
from pulsefeed.pipeline.run_all import generate_all_insights

app = FastAPI(title="PulseFeed Backend API")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Rate limiting store (in-memory per process) ─────────────────────────────
# Maps IP -> list of attempt timestamps
_attempt_log: dict = defaultdict(list)
MAX_ATTEMPTS = int(os.getenv("ACCESS_GATE_MAX_ATTEMPTS", "5"))
WINDOW_SECONDS = 3600  # 1 hour window

def _is_rate_limited(ip: str) -> bool:
    now = time.time()
    # Prune old attempts outside the window
    _attempt_log[ip] = [t for t in _attempt_log[ip] if now - t < WINDOW_SECONDS]
    if len(_attempt_log[ip]) >= MAX_ATTEMPTS:
        return True
    _attempt_log[ip].append(now)
    return False

# ─── Supabase HTTP helper ─────────────────────────────────────────────────────
def _supabase_insert_waitlist(name: str, email: str) -> dict:
    import urllib.request
    import json as json_lib
    url = os.getenv("SUPABASE_URL", "").rstrip("/") + "/rest/v1/waitlist"
    anon_key = os.getenv("SUPABASE_ANON_KEY", "")
    payload = json_lib.dumps({"name": name, "email": email}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "apikey": anon_key,
            "Authorization": f"Bearer {anon_key}",
            "Prefer": "return=representation",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return {"ok": True, "status": resp.status}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        if "duplicate" in body.lower() or "unique" in body.lower():
            return {"ok": False, "reason": "already_registered"}
        return {"ok": False, "reason": body}
    except Exception as ex:
        return {"ok": False, "reason": str(ex)}

# ─── Models ───────────────────────────────────────────────────────────────────
class SearchRequest(BaseModel):
    query: str

class TokenRequest(BaseModel):
    code: str

class WaitlistRequest(BaseModel):
    name: str
    email: str

# ─── Access Gate Endpoints ────────────────────────────────────────────────────
@app.post("/api/validate-token")
async def validate_token(request: Request, body: TokenRequest):
    """
    Validates the access code submitted by the user.
    The real code lives only in the environment — never in the frontend.
    Uses timing-safe comparison to prevent timing attacks.
    Rate-limited to MAX_ATTEMPTS per IP per hour.
    """
    client_ip = request.client.host if request.client else "unknown"

    if _is_rate_limited(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Too many attempts. Please try again later."
        )

    secret = os.getenv("PULSEFEED_ACCESS_CODE", "")
    if not secret:
        raise HTTPException(status_code=503, detail="Access gate not configured.")

    # Timing-safe comparison — prevents brute-force timing leakage
    submitted = body.code.strip().encode("utf-8")
    expected = secret.encode("utf-8")
    is_valid = hmac.compare_digest(
        hashlib.sha256(submitted).digest(),
        hashlib.sha256(expected).digest(),
    )

    if not is_valid:
        # Deliberately vague — don't confirm/deny whether the code format is right
        raise HTTPException(status_code=401, detail="Invalid access code.")

    return {"access": True}


@app.post("/api/join-waitlist")
async def join_waitlist(body: WaitlistRequest):
    """
    Adds a name + email to the Supabase waitlist table.
    Validates format and deduplicates on the DB side.
    """
    name = body.name.strip()
    email = body.email.strip().lower()

    if not name or len(name) < 2:
        raise HTTPException(status_code=400, detail="Please enter your full name.")
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    result = _supabase_insert_waitlist(name, email)

    if not result["ok"]:
        if result.get("reason") == "already_registered":
            raise HTTPException(status_code=409, detail="You're already on the waitlist!")
        print(f"[PulseFeed] Supabase waitlist error: {result.get('reason')}")
        raise HTTPException(status_code=502, detail="Unable to save your spot right now. Please try again.")

    return {"success": True, "message": "You're on the waitlist!"}


# ─── Insights Endpoints ───────────────────────────────────────────────────────
@app.get("/api/insights")
def read_insights(domain: Optional[str] = None):
    try:
        domain_filter = domain.split(",") if domain else None
        insights = get_all_insights(domain_filter=domain_filter)
        return insights
    except Exception as e:
        print(f"Error fetching insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search")
def search_insights(request: SearchRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        insight = generate_insight_for_query(request.query)
        return insight
    except Exception as e:
        print(f"Error during grounded search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
def generate_feed():
    try:
        doc_ids = generate_all_insights()
        return {"status": "success", "generated_count": len(doc_ids), "document_ids": doc_ids}
    except Exception as e:
        print(f"Error generating insights feed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
