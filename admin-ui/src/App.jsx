import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VenueSetup from "./pages/Dashboard/VenueSetup/index.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/venue" replace />} />
        <Route path="/admin/venue" element={<VenueSetup />} />
      </Routes>
    </BrowserRouter>
  );
}
