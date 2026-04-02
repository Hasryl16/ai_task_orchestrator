import axios from "axios";
import { Task, TaskListResponse, Execution } from "../types";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function createTask(
  title: string,
  description: string
): Promise<Task> {
  const response = await api.post<Task>("/api/tasks", { title, description });
  return response.data;
}

export async function listTasks(
  status?: string,
  limit: number = 10,
  offset: number = 0
): Promise<TaskListResponse> {
  const params: Record<string, string | number> = { limit, offset };
  if (status) params.status = status;
  const response = await api.get<TaskListResponse>("/api/tasks", { params });
  return response.data;
}

export async function getTask(id: string): Promise<Task> {
  const response = await api.get<Task>(`/api/tasks/${id}`);
  return response.data;
}

export async function executeTask(
  id: string
): Promise<{ message: string; task_id: string }> {
  const response = await api.post<{ message: string; task_id: string }>(
    `/api/tasks/${id}/execute`
  );
  return response.data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/api/tasks/${id}`);
}

export async function getExecution(id: string): Promise<Execution> {
  const response = await api.get<Execution>(`/api/executions/${id}`);
  return response.data;
}
