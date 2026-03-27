from fastapi import FastAPI

from .api.v1 import router as v1_router
from .api.legacy import router as legacy_router

APP_VERSION = "1.0.0"

app = FastAPI(title="inVisionU scoring system", version=APP_VERSION)

@app.get("/")
def read_root():
    return {"status": "Backend is online", "message": "Ready to score candidates"}


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/version")
def version():
    return {"version": APP_VERSION}
app.include_router(v1_router)
app.include_router(legacy_router)
