import { createContext, useContext, useEffect, useState } from "react";

import socket from "../socket/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(socket.connected);
  const [socketError, setSocketError] = useState(null);

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);

      setConnected(true);
      setSocketError(null);
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);

      setConnected(false);
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error.message);

      setConnected(false);
      setSocketError(error.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        socketError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error(
      "useSocketContext phải được sử dụng bên trong SocketProvider",
    );
  }

  return context;
};

export default SocketContext;
