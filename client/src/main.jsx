import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SocketProvider } from "./contexts/SocketContext";
import { UnreadMessagesProvider } from "./contexts/UnreadMessagesContext";
import App from "./App.jsx";
import "./index.css";

// Google OAuth Client ID
// TODO: Thay YOUR_GOOGLE_CLIENT_ID bằng Client ID thật từ Google Cloud Console
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <UnreadMessagesProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </UnreadMessagesProvider>
    </SocketProvider>
  </StrictMode>,
);
