from app.agents.base import BaseAgent


class BuilderAgent(BaseAgent):
    agent_type = "builder"

    def get_system_prompt(self) -> str:
        return (
            "You are an expert builder/implementer. Given a task and its plan, provide "
            "a detailed, complete solution. Respond with valid JSON only: "
            '{"solution": "string (detailed solution)", '
            '"code_blocks": [{"language": "string", "filename": "string", "code": "string"}], '
            '"key_decisions": ["string"]}'
        )

    def get_mock_output(self, task_description: str, context: dict | None) -> dict:
        steps = []
        if context and "planner" in context:
            steps = context["planner"].get("steps", [])

        step_titles = [s["title"] for s in steps] if steps else ["Core Implementation"]

        return {
            "solution": (
                f"Complete implementation for: {task_description[:80]}\n\n"
                + "\n".join(f"- {t}" for t in step_titles)
            ),
            "code_blocks": [
                {
                    "language": "python",
                    "filename": "main.py",
                    "code": (
                        "# Auto-generated solution\n"
                        "def main():\n"
                        f'    """Implementation for: {task_description[:60]}"""\n'
                        "    pass\n\n"
                        'if __name__ == "__main__":\n'
                        "    main()\n"
                    ),
                },
                {
                    "language": "markdown",
                    "filename": "README.md",
                    "code": (
                        f"# Solution\n\n## Task\n{task_description}\n\n"
                        "## Usage\n```bash\npython main.py\n```\n"
                    ),
                },
            ],
            "key_decisions": [
                "Used modular design for maintainability",
                "Prioritized readability over premature optimization",
                "Added comprehensive error handling at system boundaries",
            ],
        }
