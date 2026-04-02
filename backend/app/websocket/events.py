from datetime import datetime, timezone

from app.websocket.manager import ConnectionManager


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def emit_agent_start(manager: ConnectionManager, task_id: str, agent_type: str):
    await manager.broadcast_to_task(task_id, {
        "type": "agent_start",
        "task_id": task_id,
        "agent_type": agent_type,
        "status": "running",
        "message": f"{agent_type.capitalize()} agent started",
        "data": None,
        "timestamp": _now_iso(),
    })


async def emit_agent_progress(
    manager: ConnectionManager,
    task_id: str,
    agent_type: str,
    message: str,
    data: dict | None = None,
):
    await manager.broadcast_to_task(task_id, {
        "type": "agent_progress",
        "task_id": task_id,
        "agent_type": agent_type,
        "status": "running",
        "message": message,
        "data": data,
        "timestamp": _now_iso(),
    })


async def emit_agent_complete(
    manager: ConnectionManager, task_id: str, agent_type: str, output: dict
):
    await manager.broadcast_to_task(task_id, {
        "type": "agent_complete",
        "task_id": task_id,
        "agent_type": agent_type,
        "status": "completed",
        "message": f"{agent_type.capitalize()} agent completed",
        "data": output,
        "timestamp": _now_iso(),
    })


async def emit_agent_error(
    manager: ConnectionManager, task_id: str, agent_type: str, error: str
):
    await manager.broadcast_to_task(task_id, {
        "type": "agent_error",
        "task_id": task_id,
        "agent_type": agent_type,
        "status": "failed",
        "message": f"{agent_type.capitalize()} agent failed: {error}",
        "data": None,
        "timestamp": _now_iso(),
    })


async def emit_task_complete(manager: ConnectionManager, task_id: str):
    await manager.broadcast_to_task(task_id, {
        "type": "task_complete",
        "task_id": task_id,
        "agent_type": None,
        "status": "completed",
        "message": "Task pipeline completed",
        "data": None,
        "timestamp": _now_iso(),
    })
