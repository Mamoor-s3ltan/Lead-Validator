import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]

# IMPORTANT: use the service_role key here, not the anon/public key.
# With RLS enabled on your tables, the anon key will be blocked from
# reading/writing unless you add permissive policies for it. The
# service_role key bypasses RLS entirely and must only ever live on
# the backend — never send it to React.
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

OPENROUTER_API_KEY = os.environ["OPENROUTER_API_KEY"]
CLASSIFIER_MODEL = os.environ.get("CLASSIFIER_MODEL", "openai/gpt-4o-mini")
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

# System prompt is a committed file, read from disk at runtime.
PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "prompts", "classifier.md")

ALLOWED_CATEGORIES = {
    "agency",
    "ecommerce",
    "saas",
    "local_service",
    "education",
    "media_publisher",
    "financial_services",
    "other",
}

MIN_CONTENT_LENGTH = 200