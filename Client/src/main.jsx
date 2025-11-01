import React from "react";
import { StrictMode } from "react";
import createRoot from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes/Router";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot.createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
