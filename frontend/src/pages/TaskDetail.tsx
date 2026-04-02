import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import { useTask } from "../hooks/useTask";
import { executeTask, deleteTask } from "../services/api";
import { ExecutionTimeline } from "../components/ExecutionTimeline";
import { AgentStatus } from "../components/AgentStatus";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { messages, connected, lastMessage } = useWebSocket(id || null);
  const { task, loading, error } = useTask(id || null, lastMessage);
  const [executing, setExecuting] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!id) return;
    setExecuting(true);
    setExecError(null);
    try {
      await executeTask(id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to start pipeline";
      setExecError(message);
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      navigate("/");
    } catch {
      setExecError("Failed to delete task. Please try again.");
    }
  };

  // Determine active agent from WS messages
  const activeAgent =
    lastMessage?.status === "running" ? lastMessage.agent_type : null;

  if (loading && !task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">
        Loading task...
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => navigate("/")}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to Dashboard
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">{task.title}</h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  STATUS_COLORS[task.status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {task.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-gray-600">{task.description}</p>
            <div className="text-xs text-gray-400 mt-2">
              Created: {new Date(task.created_at).toLocaleString()}
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={handleExecute}
              disabled={executing || task.status === "in_progress"}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
            >
              {executing
                ? "Starting..."
                : task.status === "in_progress"
                ? "Running..."
                : "Run Pipeline"}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 font-medium text-sm"
            >
              Delete
            </button>
          </div>
        </div>
        {execError && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded text-sm">
            {execError}
          </div>
        )}
      </div>

      {/* Agent status */}
      <div className="mb-6">
        <AgentStatus lastMessage={lastMessage} connected={connected} />
      </div>

      {/* Execution timeline */}
      <ExecutionTimeline
        executions={task.executions}
        activeAgent={activeAgent}
      />

      {/* WS Messages log */}
      {messages.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Activity Log
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className="text-sm flex items-start space-x-2">
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-gray-700">{msg.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
