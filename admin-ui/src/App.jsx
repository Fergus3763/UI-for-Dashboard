import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VenueSetup from "./pages/Dashboard/VenueSetup/index.jsx";
import Rooms from "./pages/Dashboard/Rooms/index.jsx";
import FoodBeverage from "./pages/Dashboard/FoodBeverage/index.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/venue" replace />} />
        <Route path="/admin/venue" element={<VenueSetup />} />
        <Route path="/admin/rooms" element={<Rooms />} />
        <Route path="/admin/fnb" element={<FoodBeverage />} />
      </Routes>
    </BrowserRouter>
  );
}
