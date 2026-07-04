import os
import sys
from dotenv import load_dotenv

# Ensure root directory is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pipeline.gemini_client import call_gemini

# Load environment variables
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(parent_dir, ".env"))

# Convert GOOGLE_APPLICATION_CREDENTIALS to absolute if relative
creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if creds_path and not os.path.isabs(creds_path):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.abspath(os.path.join(parent_dir, creds_path))

def test_fallback():
    print("Starting Vertex AI fallback test...")
    original_key = os.environ.get("GEMINI_API_KEY")
    
    # 1. Temporarily corrupt the AI Studio API Key to guarantee primary failure
    os.environ["GEMINI_API_KEY"] = "AIzaSyInvalidKey_DeliberateFailureForTestingOnly"
    
    prompt = """
    Return a JSON object with a single field 'greeting' set to 'Hello'.
    """
    
    try:
        # We don't enforce a complex schema here, just check fallback works and yields a JSON
        result = call_gemini(prompt, use_search_grounding=False)
        print("Response received:")
        print(result)
        
        assert "error" not in result, f"Test failed with error: {result.get('error')}"
        assert result.get("greeting") == "Hello", f"Unexpected response shape: {result}"
        print("\nSUCCESS: Vertex AI fallback successfully triggered and returned correct response!")
    finally:
        # 2. Restore the original key
        if original_key:
            os.environ["GEMINI_API_KEY"] = original_key
        else:
            os.environ.pop("GEMINI_API_KEY", None)

if __name__ == "__main__":
    test_fallback()
