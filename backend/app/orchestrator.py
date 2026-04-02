import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.agents.builder import BuilderAgent
from app.agents.planner import PlannerAgent
from app.agents.validator import ValidatorAgent
from app.models import Execution, Task
from app.websocket.events import (
    emit_agent_complete,
    emit_agent_error,
    emit_agent_start,
    emit_task_complete,
)
from app.websocket.manager import ConnectionManager

logger = logging.getLogger(__name__)


async def run_task_pipeline(
    task_id: str, db: AsyncSession, manager: ConnectionManager, api_key: str
):
    """Run planner -> builder -> validator pipeline for a task."""
    # Load task
    result = await db.execute(
        select(Task).where(Task.id == task_id).options(selectinload(Task.executions))
    )
    task = result.scalar_one_or_none()
    if not task:
        logger.error(f"Task {task_id} not found")
        return

    # Update task status
    task.status = "in_progress"
    await db.commit()

    agents = [
        PlannerAgent(api_key=api_key),
        BuilderAgent(api_key=api_key),
        ValidatorAgent(api_key=api_key),
    ]

    context: dict = {}
    task_failed = False
    tid = str(task_id)

    for agent in agents:
        # Create execution record
        execution = Execution(
            task_id=task.id,
            agent_type=agent.agent_type,
            status="queued",
            input_data={"task_description": task.description, "context": context} if context else {"task_description": task.description},
        )
        db.add(execution)
        await db.commit()
        await db.refresh(execution)

        # Emit start event
        await emit_agent_start(manager, tid, agent.agent_type)

        # Update to running
        execution.status = "running"
        execution.started_at = datetime.now(timezone.utc)
        await db.commit()

        try:
            agent_result = await agent.run(task.description, context if context else None)

            # Update execution as completed
            execution.status = "completed"
            execution.output_data = agent_result.output
            execution.completed_at = datetime.now(timezone.utc)
            await db.commit()

            # Accumulate context for next agent
            context[agent.agent_type] = agent_result.output

            await emit_agent_complete(manager, tid, agent.agent_type, agent_result.output)

        except Exception as exc:
            logger.exception(f"Agent {agent.agent_type} failed for task {task_id}")
            execution.status = "failed"
            execution.error_message = str(exc)
            execution.completed_at = datetime.now(timezone.utc)
            await db.commit()

            await emit_agent_error(manager, tid, agent.agent_type, str(exc))
            task_failed = True
            break

    # Update task final status
    task.status = "failed" if task_failed else "completed"
    await db.commit()

    if not task_failed:
        await emit_task_complete(manager, tid)
