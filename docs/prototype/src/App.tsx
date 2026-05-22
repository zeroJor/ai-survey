import { Navigate, Route, Routes } from "react-router-dom";
import { TalkPage } from "./pages/TalkPage";

export default function App() {
  return (
    <Routes>
      <Route path="/talk" element={<TalkPage />} />
      <Route path="*" element={<Navigate to="/talk" replace />} />
    </Routes>
  );
}
