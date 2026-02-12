#!/usr/bin/env python3
"""
List available Google Gemini / Generative models for the configured API key.
Tries SDK first (google.generativeai.list_models), then falls back to HTTP GET
on the public endpoint.

Usage:
  python scripts/list_gemini_models.py

Ensure GEMINI_API_KEY is set in your environment or in .env
"""
import os
import json
import sys
from dotenv import load_dotenv
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("GEMINI_API_KEY not set in environment or .env", file=sys.stderr)
    sys.exit(1)

# Try SDK
try:
    import google.generativeai as genai
    if hasattr(genai, 'list_models'):
        genai.configure(api_key=API_KEY)
        print("Using google.generativeai.list_models()")
        models = genai.list_models()
        print(json.dumps(models, indent=2, ensure_ascii=False))
        sys.exit(0)
    # Some SDKs expose different names; try attribute discovery
    if hasattr(genai, 'Models'):
        genai.configure(api_key=API_KEY)
        try:
            models = genai.Models.list()
            print(json.dumps(models, indent=2, ensure_ascii=False))
            sys.exit(0)
        except Exception:
            pass
except Exception as e:
    print(f"SDK list_models attempt failed: {e}", file=sys.stderr)

# Fallback to HTTP REST call
import requests

BASE = 'https://generativelanguage.googleapis.com/v1beta'
url = f"{BASE}/models"

print(f"Falling back to REST GET {url}")

# Try Bearer Authorization first
headers = {"Authorization": f"Bearer {API_KEY}"}
try:
    r = requests.get(url, headers=headers, timeout=10)
    if r.status_code == 200:
        print(r.text)
        sys.exit(0)
    else:
        print(f"Bearer auth returned status {r.status_code}: {r.text}", file=sys.stderr)
except Exception as e:
    print(f"Bearer request failed: {e}", file=sys.stderr)

# Try API key param
try:
    r = requests.get(url, params={"key": API_KEY}, timeout=10)
    if r.status_code == 200:
        print(r.text)
        sys.exit(0)
    else:
        print(f"API key param returned status {r.status_code}: {r.text}", file=sys.stderr)
except Exception as e:
    print(f"API key request failed: {e}", file=sys.stderr)

print("Failed to list models with SDK and REST. Check API key and network.")
sys.exit(2)
