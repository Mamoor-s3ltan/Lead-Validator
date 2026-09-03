from libs.config import supabase


def get_leads_with_latest() -> list[dict]:
    """
    Every lead, merged with its most recent classification (if any).
    supabase-py has no server-side DISTINCT ON, so we pull both tables
    and reduce to "latest per lead_id" here in Python.
    """
    leads_resp = supabase.table("leads").select("*").order("id").execute()
    leads = leads_resp.data or []

    classifications_resp = (
        supabase.table("classifications")
        .select("*")
        .order("classified_at", desc=True)
        .execute()
    )
    classifications = classifications_resp.data or []

    # Sorted desc, so the first time we see a lead_id is its latest row.
    latest_by_lead: dict[int, dict] = {}
    for c in classifications:
        latest_by_lead.setdefault(c["lead_id"], c)

    merged = []
    for lead in leads:
        latest = latest_by_lead.get(lead["id"])
        merged.append(
            {
                **lead,
                "category": latest["category"] if latest else None,
                "confidence": latest["confidence"] if latest else None,
                "reasoning": latest["reasoning"] if latest else None,
                "model": latest["model"] if latest else None,
                "classified_at": latest["classified_at"] if latest else None,
            }
        )
    return merged


def get_lead(lead_id: int) -> dict | None:
    resp = supabase.table("leads").select("*").eq("id", lead_id).execute()
    rows = resp.data or []
    return rows[0] if rows else None


def insert_classification(lead_id: int, category: str, confidence: int, reasoning: str, model: str) -> dict:
    resp = (
        supabase.table("classifications")
        .insert(
            {
                "lead_id": lead_id,
                "category": category,
                "confidence": confidence,
                "reasoning": reasoning,
                "model": model,
            }
        )
        .execute()
    )
    return resp.data[0]