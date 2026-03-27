import httpx


def analyze_url(base_url: str) -> str:
    clean = base_url.rstrip("/")
    if clean.endswith("/analyze"):
        return clean
    if clean.endswith("/api/v1"):
        return f"{clean}/analyze"
    return f"{clean}/analyze"


def candidate_status_url(base_url: str, candidate_id: str) -> str:
    clean = base_url.rstrip("/")
    if clean.endswith("/api/v1"):
        return f"{clean}/candidates/{candidate_id}"
    return f"{clean}/candidates/{candidate_id}"


async def submit_candidate(api_url: str, payload: dict) -> httpx.Response:
    async with httpx.AsyncClient(timeout=60.0) as client:
        return await client.post(analyze_url(api_url), json=payload)


async def get_candidate_status(api_url: str, candidate_id: str) -> httpx.Response:
    async with httpx.AsyncClient(timeout=30.0) as client:
        return await client.get(candidate_status_url(api_url, candidate_id))

