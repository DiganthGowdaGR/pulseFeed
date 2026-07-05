import os
import sys

# Ensure the root folder, backend, and pulsefeed directories are in Python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root_dir)
sys.path.append(os.path.join(root_dir, "pulsefeed"))
sys.path.append(os.path.join(root_dir, "pulsefeed", "pipeline"))

# Import the FastAPI app instance from backend.main
from backend.main import app
