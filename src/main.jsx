import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import PortfolioAnalytics from "./PortfolioAnalytics";
import "./styles.css";
import "./section-explore.css";
import "./project-archive-grid.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <PortfolioAnalytics />
  </StrictMode>,
);
