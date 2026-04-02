import json

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, task_id: str):
        await websocket.accept()
        if task_id not in self.active_connections:
            self.active_connections[task_id] = []
        self.active_connections[task_id].append(websocket)

    def disconnect(self, websocket: WebSocket, task_id: str):
        if task_id in self.active_connections:
            self.active_connections[task_id] = [
                ws for ws in self.active_connections[task_id] if ws is not websocket
            ]
            if not self.active_connections[task_id]:
                del self.active_connections[task_id]

    async def broadcast_to_task(self, task_id: str, message: dict):
        if task_id not in self.active_connections:
            return
        dead_connections = []
        for websocket in self.active_connections[task_id]:
            try:
                await websocket.send_text(json.dumps(message))
            except Exception:
                dead_connections.append(websocket)
        for ws in dead_connections:
            self.disconnect(ws, task_id)


manager = ConnectionManager()
