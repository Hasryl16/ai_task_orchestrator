from app.agents.base import BaseAgent


class PlannerAgent(BaseAgent):
    agent_type = "planner"

    def get_system_prompt(self) -> str:
        return (
            "You are a task planning expert. Break down the user's task into clear, "
            "executable steps. Respond with valid JSON only in this format: "
            '{"steps": [{"id": 1, "title": "string", "description": "string", '
            '"estimated_minutes": int}], "total_estimated_minutes": int, '
            '"complexity": "low|medium|high"}'
        )

    def get_mock_output(self, task_description: str, context: dict | None) -> dict:
        return {
            "steps": [
                {
                    "id": 1,
                    "title": "Requirements Analysis",
                    "description": f"Analyze the requirements for: {task_description[:80]}",
                    "estimated_minutes": 10,
                },
                {
                    "id": 2,
                    "title": "Design & Architecture",
                    "description": "Define the system design, data models, and component structure.",
                    "estimated_minutes": 20,
                },
                {
                    "id": 3,
                    "title": "Core Implementation",
                    "description": "Build the main functionality according to the design.",
                    "estimated_minutes": 45,
                },
                {
                    "id": 4,
                    "title": "Testing & Validation",
                    "description": "Write tests and validate all edge cases.",
                    "estimated_minutes": 15,
                },
                {
                    "id": 5,
                    "title": "Documentation",
                    "description": "Write clear documentation and usage examples.",
                    "estimated_minutes": 10,
                },
            ],
            "total_estimated_minutes": 100,
            "complexity": "medium",
        }
