from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1 import router as v1_router
from .api.legacy import router as legacy_router
from .api.websocket import router as ws_router
from .api.auth import router as auth_router
from .api.notifications import router as notifications_router

APP_VERSION = "1.0.0"

app = FastAPI(title="inVisionU scoring system", version=APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "Backend is online", "message": "Ready to score candidates"}


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/version")
def version():
    return {"version": APP_VERSION}


app.include_router(auth_router)
app.include_router(notifications_router)
app.include_router(v1_router)
app.include_router(legacy_router)
app.include_router(ws_router)
