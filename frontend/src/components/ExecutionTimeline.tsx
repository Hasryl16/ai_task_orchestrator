import React, { useState } from "react";
import { Execution } from "../types";

interface Props {
  executions: Execution[];
  activeAgent: string | null;
}

const AGENT_ORDER: Array<"planner" | "builder" | "validator"> = [
  "planner",
  "builder",
  "validator",
];

const AGENT_LABELS: Record<string, string> = {
  planner: "Planner",
  builder: "Builder",
  validator: "Validator",
};

const AGENT_ICONS: Record<string, string> = {
  planner: "P",
  builder: "B",
  validator: "V",
};

function StatusIcon({ status, isActive }: { status: string; isActive: boolean }) {
  if (status === "completed") {
    return (
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  if (status === "running" || isActive) {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white pulse-active">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
      {status === "queued" ? "..." : "-"}
    </div>
  );
}

export function ExecutionTimeline({ executions, activeAgent }: Props) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const executionMap: Record<string, Execution> = {};
  executions.forEach((ex) => {
    executionMap[ex.agent_type] = ex;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Execution Pipeline
      </h3>
      <div className="space-y-0">
        {AGENT_ORDER.map((agentType, index) => {
          const execution = executionMap[agentType];
          const status = execution?.status || "pending";
          const isActive = activeAgent === agentType;
          const isExpanded = expandedAgent === agentType;
          const isLast = index === AGENT_ORDER.length - 1;

          return (
            <div key={agentType} className="relative">
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`absolute left-5 top-10 w-0.5 h-8 ${
                    status === "completed" ? "bg-green-300" : "bg-gray-200"
                  }`}
                />
              )}
              <div
                className="flex items-start space-x-4 pb-8 cursor-pointer"
                onClick={() =>
                  setExpandedAgent(isExpanded ? null : agentType)
                }
              >
                <StatusIcon status={status} isActive={isActive} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">
                      {AGENT_ICONS[agentType]}{" "}
                      {AGENT_LABELS[agentType]}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        status === "completed"
                          ? "bg-green-100 text-green-800"
                          : status === "running"
                          ? "bg-blue-100 text-blue-800"
                          : status === "failed"
                          ? "bg-red-100 text-red-800"
                          : status === "queued"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  {execution?.error_message && (
                    <p className="text-sm text-red-600 mt-1">
                      {execution.error_message}
                    </p>
                  )}
                  {isExpanded && execution?.output_data && (
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-700 overflow-auto max-h-64">
                      {JSON.stringify(execution.output_data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
