from app.agents.base import BaseAgent


class ValidatorAgent(BaseAgent):
    agent_type = "validator"

    def get_system_prompt(self) -> str:
        return (
            "You are a code reviewer and quality validator. Review the provided solution "
            "for correctness, completeness, security, and best practices. Respond with "
            'valid JSON only: {"approved": bool, "score": int (0-100), '
            '"issues": [{"severity": "error|warning|info", "description": "string"}], '
            '"suggestions": ["string"], "summary": "string"}'
        )

    def get_mock_output(self, task_description: str, context: dict | None) -> dict:
        key_decisions = []
        if context and "builder" in context:
            key_decisions = context["builder"].get("key_decisions", [])

        return {
            "approved": True,
            "score": 87,
            "issues": [
                {
                    "severity": "warning",
                    "description": "Consider adding input validation at all entry points.",
                },
                {
                    "severity": "info",
                    "description": "Unit test coverage could be improved for edge cases.",
                },
            ],
            "suggestions": [
                "Add type hints throughout for better IDE support",
                "Consider extracting configuration into a dedicated config module",
                *(f"Verified: {d}" for d in key_decisions[:2]),
            ],
            "summary": (
                "Solution is well-structured and meets the requirements. "
                "Minor improvements recommended but no blocking issues found. "
                "Approved for deployment."
            ),
        }
