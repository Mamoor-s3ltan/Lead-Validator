import json
from openai import AsyncOpenAI
from libs.config import OPENROUTER_API_KEY, CLASSIFIER_MODEL, PROMPT_PATH, ALLOWED_CATEGORIES

client = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
)


def load_system_prompt() -> str:
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        return f.read()


def _build_user_message(company_name: str, url: str | None, content: str) -> str:
    return (
        f"Company: {company_name}\n"
        f"URL: {url or '(none provided)'}\n\n"
        f"Page content:\n\"\"\"\n{content[:8000]}\n\"\"\""
    )


def _parse_and_validate(raw: str) -> dict:
    data = json.loads(raw)  # raises if not valid JSON — caller handles retry
    category = data.get("category")
    confidence = data.get("confidence")
    reasoning = data.get("reasoning")

    if category not in ALLOWED_CATEGORIES:
        raise ValueError(f"Invalid category returned: {category!r}")
    if not isinstance(confidence, int) or not (0 <= confidence <= 100):
        raise ValueError(f"Invalid confidence returned: {confidence!r}")
    if not reasoning or not isinstance(reasoning, str):
        raise ValueError("Missing or invalid reasoning")

    return {"category": category, "confidence": confidence, "reasoning": reasoning}


async def _call_llm(system_prompt: str, user_message: str) -> str:
    response = await client.chat.completions.create(
        model=CLASSIFIER_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        response_format={"type": "json_object"},
        temperature=0,
    )
    return response.choices[0].message.content


async def classify_content(company_name: str, url: str | None, content: str) -> dict:
    """
    Runs the LLM classification with one retry on malformed/invalid output.
    Returns dict with category, confidence, reasoning. Raises on repeated failure.
    """
    system_prompt = load_system_prompt()
    user_message = _build_user_message(company_name, url, content)

    last_error = None
    for attempt in range(2):
        try:
            raw = await _call_llm(system_prompt, user_message)
            return _parse_and_validate(raw)
        except (json.JSONDecodeError, ValueError) as e:
            last_error = e
            user_message += (
                "\n\nYour previous response was invalid. Respond with ONLY a JSON object "
                'of the exact shape {"category": "...", "confidence": 0-100, "reasoning": "..."}. '
                "category must be exactly one of: agency, ecommerce, saas, local_service, "
                "education, media_publisher, financial_services, other."
            )

    raise RuntimeError(f"LLM classification failed after retry: {last_error}")


def no_url_result() -> dict:
    """Deterministic result for leads with no URL — no LLM call needed."""
    return {
        "category": "other",
        "confidence": 0,
        "reasoning": "No URL was provided for this lead, so no content could be assessed.",
    }