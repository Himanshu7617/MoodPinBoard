import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivacyPage from "./pages/PrivacyPage.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/*" element={<App />} />
      <Route path="/privacy" element={<PrivacyPage />} />
    </Routes>
  </BrowserRouter>
);
