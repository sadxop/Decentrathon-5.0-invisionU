from __future__ import annotations

import asyncio
import json
from typing import Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._connections.add(ws)

    async def disconnect(self, ws: WebSocket) -> None:
        async with self._lock:
            self._connections.discard(ws)

    async def broadcast(self, data: dict) -> None:
        if not self._connections:
            return
        message = json.dumps(data, ensure_ascii=False)
        dead: list[WebSocket] = []
        async with self._lock:
            connections = list(self._connections)
        for ws in connections:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            await self.disconnect(ws)


manager = ConnectionManager()


@router.websocket("/ws/notifications")
async def ws_notifications(ws: WebSocket) -> None:
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(ws)
