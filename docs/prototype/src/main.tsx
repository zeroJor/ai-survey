import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <MotionConfig transition={{ duration: 0.28, ease: [0.33, 1, 0.68, 1] }}>
        <App />
      </MotionConfig>
    </ErrorBoundary>
  </StrictMode>,
);
