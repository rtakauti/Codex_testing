import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { appTestUtils } from "./App";
import { chartTestUtils } from "./charts";
import { createFormatters, getLocaleCopy } from "./i18n";
import { podcastDataTestUtils } from "./podcastData";
import "./styles.css";

window.__poddataTestUtils__ = {
  appTestUtils,
  chartTestUtils,
  createFormatters,
  getLocaleCopy,
  podcastDataTestUtils,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
