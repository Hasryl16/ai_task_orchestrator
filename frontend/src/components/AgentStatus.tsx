import React from "react";
import { WSMessage } from "../types";

interface Props {
  lastMessage: WSMessage | null;
  connected: boolean;
}

export function AgentStatus({ lastMessage, connected }: Props) {
  if (!lastMessage) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span className="text-sm text-gray-500">
            {connected ? "Connected - Waiting for activity" : "Disconnected"}
          </span>
        </div>
      </div>
    );
  }

  const isRunning =
    lastMessage.status === "running" || lastMessage.type === "agent_start";

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center space-x-3">
        {isRunning && (
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        <div>
          {lastMessage.agent_type && (
            <span className="text-sm font-medium text-gray-700 capitalize">
              {lastMessage.agent_type} Agent
            </span>
          )}
          <p className="text-sm text-gray-500">{lastMessage.message}</p>
        </div>
      </div>
    </div>
  );
}
