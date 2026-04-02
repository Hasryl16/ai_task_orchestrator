export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  executions: Execution[];
}

export interface Execution {
  id: string;
  task_id: string;
  agent_type: "planner" | "builder" | "validator";
  status: "queued" | "running" | "completed" | "failed";
  input_data: Record<string, unknown> | null;
  output_data: Record<string, unknown> | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface WSMessage {
  type: string;
  task_id: string;
  agent_type: string | null;
  status: string | null;
  message: string;
  data: Record<string, unknown> | null;
  timestamp: string;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  limit: number;
  offset: number;
}
