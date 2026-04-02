import asyncio
import json
from abc import ABC, abstractmethod
from dataclasses import dataclass

from anthropic import AsyncAnthropic


@dataclass
class AgentResult:
    output: dict
    raw_text: str
    tokens_used: int


class BaseAgent(ABC):
    agent_type: str = ""
    model: str = "claude-opus-4-6"

    def __init__(self, api_key: str):
        self._api_key = api_key
        self._client: AsyncAnthropic | None = None

    @property
    def client(self) -> AsyncAnthropic:
        if self._client is None:
            self._client = AsyncAnthropic(api_key=self._api_key)
        return self._client

    @abstractmethod
    def get_system_prompt(self) -> str:
        ...

    @abstractmethod
    def get_mock_output(self, task_description: str, context: dict | None) -> dict:
        ...

    async def run(self, task_description: str, context: dict | None = None) -> AgentResult:
        from app.config import settings

        if settings.MOCK_MODE:
            await asyncio.sleep(2)  # simulate processing time
            output = self.get_mock_output(task_description, context)
            raw_text = json.dumps(output)
            return AgentResult(output=output, raw_text=raw_text, tokens_used=0)

        user_content = f"Task: {task_description}"
        if context:
            user_content += f"\n\nContext from previous agents:\n{json.dumps(context, indent=2)}"

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=self.get_system_prompt(),
            messages=[{"role": "user", "content": user_content}],
        )

        raw_text = response.content[0].text
        tokens_used = (response.usage.input_tokens or 0) + (response.usage.output_tokens or 0)

        try:
            output = json.loads(raw_text)
        except json.JSONDecodeError:
            start = raw_text.find("{")
            end = raw_text.rfind("}") + 1
            if start != -1 and end > start:
                try:
                    output = json.loads(raw_text[start:end])
                except json.JSONDecodeError:
                    output = {"raw_response": raw_text}
            else:
                output = {"raw_response": raw_text}

        return AgentResult(output=output, raw_text=raw_text, tokens_used=tokens_used)
