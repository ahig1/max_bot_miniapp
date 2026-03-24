import { StrictMode } from "react";
import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

if (window.location.hostname !== 'localhost') {
  Sentry.init({
    dsn: "https://81967090ef767bee22fdf0264602c8af@o4508982442590208.ingest.de.sentry.io/4508982444621904",
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
