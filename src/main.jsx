import React from "react";
import ReactDOM from "react-dom/client";
import { Router } from "./navigation";
import App from "./App";
import ToastContainer from "./components/ToastContainer";
import "./globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
ReactDOM.createRoot(root).render(
  <Router>
    <App />
    <ToastContainer />
  </Router>
);
