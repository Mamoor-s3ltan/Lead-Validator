import httpx
from libs.config import MIN_CONTENT_LENGTH


async def fetch_via_jina(url: str) -> str:
    """Fetch page content through Jina AI Reader. Free, no key required."""
    jina_url = f"https://r.jina.ai/{url}"
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.get(jina_url)
        resp.raise_for_status()
        return resp.text


async def fetch_via_playwright(url: str) -> str:
    """Fallback: render the page in a real headless browser and grab visible text."""
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        try:
            await page.goto(url, timeout=20000, wait_until="domcontentloaded")
            text = await page.inner_text("body")
        finally:
            await browser.close()
        return text


async def fetch_page_content(url: str | None) -> tuple[str | None, str]:
    """
    Returns (content, source) where source is 'jina', 'playwright', or 'none'.
    content is None if the lead has no URL or both fetch methods failed.
    """
    if not url:
        return None, "none"

    try:
        content = await fetch_via_jina(url)
        if content and len(content.strip()) >= MIN_CONTENT_LENGTH:
            return content, "jina"
    except Exception:
        pass  # fall through to Playwright

    try:
        content = await fetch_via_playwright(url)
        if content and len(content.strip()) >= MIN_CONTENT_LENGTH:
            return content, "playwright"
    except Exception:
        pass

    return None, "none"