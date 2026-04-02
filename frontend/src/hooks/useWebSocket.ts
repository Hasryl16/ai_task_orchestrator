import { useEffect, useRef, useState, useCallback } from "react";
import { WSMessage } from "../types";

const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8000";

export function useWebSocket(taskId: string | null) {
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);
  const maxRetries = 3;

  const connect = useCallback(() => {
    if (!taskId || unmountedRef.current) return;

    const ws = new WebSocket(`${WS_URL}/ws/tasks/${taskId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
        setLastMessage(msg);
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (!unmountedRef.current && retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        retryTimerRef.current = setTimeout(connect, 2000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [taskId]);

  useEffect(() => {
    unmountedRef.current = false;
    setMessages([]);
    setLastMessage(null);
    connect();

    return () => {
      unmountedRef.current = true;
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { messages, connected, lastMessage };
}
