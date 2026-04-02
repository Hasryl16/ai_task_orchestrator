import { useEffect, useState, useCallback } from "react";
import { Task, WSMessage } from "../types";
import { getTask } from "../services/api";

export function useTask(taskId: string | null, lastMessage: WSMessage | null) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTask(taskId);
      setTask(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load task";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refresh when a WS message arrives
  useEffect(() => {
    if (lastMessage) {
      refresh();
    }
  }, [lastMessage, refresh]);

  return { task, loading, error, refresh };
}

//hello
