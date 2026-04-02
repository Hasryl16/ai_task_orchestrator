import React, { createContext, useContext, ReactNode } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { WSMessage } from "../types";

interface WSContextType {
  messages: WSMessage[];
  connected: boolean;
  lastMessage: WSMessage | null;
}

const WSContext = createContext<WSContextType>({
  messages: [],
  connected: false,
  lastMessage: null,
});

export function useWSContext() {
  return useContext(WSContext);
}

interface Props {
  taskId: string | null;
  children: ReactNode;
}

export function WebSocketProvider({ taskId, children }: Props) {
  const ws = useWebSocket(taskId);

  return <WSContext.Provider value={ws}>{children}</WSContext.Provider>;
}
