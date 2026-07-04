import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Robustly load the .env file in the pulsefeed directory
current_dir = os.path.dirname(os.path.abspath(__file__))
pulsefeed_dir = os.path.dirname(current_dir)
env_path = os.path.join(pulsefeed_dir, ".env")
load_dotenv(env_path)

# Convert GOOGLE_APPLICATION_CREDENTIALS to an absolute path if it is relative
creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if creds_path and not os.path.isabs(creds_path):
    abs_creds = os.path.abspath(os.path.join(pulsefeed_dir, "..", creds_path))
    if not os.path.exists(abs_creds):
        abs_creds = os.path.abspath(os.path.join(pulsefeed_dir, os.path.basename(creds_path)))
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = abs_creds

def clean_json_text(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def extract_grounding_info(response) -> tuple[list[str], str | None]:
    sources = []
    search_suggestions_html = None
    try:
        candidate = response.candidates[0]
        if hasattr(candidate, "grounding_metadata") and candidate.grounding_metadata:
            meta = candidate.grounding_metadata
            # Extract chunks (source URLs / titles)
            if hasattr(meta, "grounding_chunks") and meta.grounding_chunks:
                for chunk in meta.grounding_chunks:
                    if hasattr(chunk, "web") and chunk.web:
                        title = getattr(chunk.web, "title", "")
                        uri = getattr(chunk.web, "uri", "")
                        if uri:
                            sources.append(uri)
            # Extract search suggestions
            if hasattr(meta, "search_entry_point") and meta.search_entry_point:
                entry = meta.search_entry_point
                if hasattr(entry, "rendered_content") and entry.rendered_content:
                    search_suggestions_html = entry.rendered_content
    except Exception as e:
        print(f"Warning: Failed to extract grounding metadata: {e}")
    return sources, search_suggestions_html

def call_gemini(prompt: str, use_search_grounding: bool = False, response_schema: type = None) -> dict:
    # 1. PRIMARY: AI Studio
    api_key = os.getenv("GEMINI_API_KEY")
    client = None
    response = None
    
    # Configure generation tools and schema
    if use_search_grounding:
        tools = [types.Tool(google_search=types.GoogleSearch())]
        config = types.GenerateContentConfig(
            tools=tools
        )
    else:
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=response_schema
        )
    
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=config
        )
    except Exception as e:
        # 2. FALLBACK: Vertex AI
        print(f"[FALLBACK] AI Studio failed ({e}), retrying via Vertex AI...")
        try:
            project_id = os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("FIRESTORE_PROJECT_ID")
            # Fallback to us-central1 for Vertex AI Gemini API
            client = genai.Client(vertexai=True, project=project_id, location="us-central1")
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=config
            )
        except Exception as fallback_err:
            print(f"ERROR: Both AI Studio and Vertex AI failed. Fallback error: {fallback_err}")
            return {"error": f"Model generation failed: {fallback_err}"}

    # 3. Parse and extract metadata
    try:
        text_content = response.text
        cleaned = clean_json_text(text_content)
        result = json.loads(cleaned)
        
        # Inject search grounding metadata if used
        if use_search_grounding:
            sources, search_suggestions = extract_grounding_info(response)
            if sources:
                result["sources"] = sources
            if search_suggestions:
                result["search_suggestions_html"] = search_suggestions
                
        return result
    except Exception as parse_err:
        raw_text = response.text if response else "N/A"
        print(f"ERROR: Failed to parse Gemini response as JSON: {parse_err}. Raw text: {raw_text}")
        return {"error": f"JSON parsing failed: {parse_err}", "raw_response": raw_text}
