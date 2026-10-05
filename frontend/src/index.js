import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./theme.css";
 
// Change "light" to "dark" to switch the whole app's theme
document.documentElement.setAttribute("data-bs-theme", "light");
 
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
