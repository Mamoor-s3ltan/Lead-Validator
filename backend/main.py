from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

from libs.config import FRONTEND_ORIGIN, CLASSIFIER_MODEL
from libs.db import get_leads_with_latest, get_lead, insert_classification,insert_lead
from libs.fetchContent import fetch_page_content
from libs.Classifier import classify_content, no_url_result

app = FastAPI(title="Lead Validator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory guard against double-submitting the same lead while a
# classification is already running. Fine for a single-instance app.
_in_flight: set[int] = set()

class LeadCreate(BaseModel):
    company_name: str
    url: HttpUrl | None = None

@app.get("/data")
async def list_leads():
    try:
        leads = get_leads_with_latest()
        return leads
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Error loading leads: {err}")


@app.post("/leads/{lead_id}/classify")
async def classify_lead(lead_id: int):
    if lead_id in _in_flight:
        raise HTTPException(status_code=409, detail="This lead is already being classified.")

    lead = get_lead(lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found.")

    _in_flight.add(lead_id)
    try:
        if not lead["url"]:
            result = no_url_result()
        else:
            content, source = await fetch_page_content(lead["url"])
            print("Website content chars:", len(content))
            

            if content is None:
                raise HTTPException(
                    status_code=502,
                    detail="Could not fetch page content via Jina or Playwright.",
                )
            result = await classify_content(lead["company_name"], lead["url"], content)
           

        saved = insert_classification(
            lead_id=lead_id,
            category=result["category"],
            confidence=result["confidence"],
            reasoning=result["reasoning"],
            model=CLASSIFIER_MODEL,
        )
        return saved
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {e}")
    finally:
        _in_flight.discard(lead_id)


@app.post("/leads")
async def create_lead(payload: LeadCreate):
    company_name = payload.company_name.strip()
    if not company_name:
        raise HTTPException(status_code=422, detail="Company name is required.")

    try:
        lead = insert_lead(
            company_name=company_name,
            url=str(payload.url) if payload.url else None,
        )
        return lead
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Error creating lead: {err}")