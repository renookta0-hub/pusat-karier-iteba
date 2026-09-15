import React from "react";
import ReactDOM from "react-dom/client";
import { installStorageShim } from "./storage-shim.js";
import App from "./App.jsx";
import "./index.css";

installStorageShim();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
