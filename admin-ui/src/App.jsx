import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import VenueSetup from "./pages/Dashboard/VenueSetup/index.jsx";
import Rooms from "./pages/Dashboard/Rooms/index.jsx";
import FoodBeverage from "./pages/Dashboard/FoodBeverage/index.jsx";
import AV from "./pages/Dashboard/AV/index.jsx";
import Labour from "./pages/Dashboard/Labour/index.jsx";
import ThirdParty from "./pages/Dashboard/ThirdParty/index.jsx"; // will exist after Step 2

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/admin/venue">Venue</Link>
        <Link to="/admin/rooms">Rooms</Link>
        <Link to="/admin/fnb">F&amp;B</Link>
        <Link to="/admin/av">AV</Link>
        <Link to="/admin/labour">Labour</Link>
        <Link to="/admin/third-party">3rd-Party</Link>
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/venue" replace />} />
        <Route path="/admin/venue" element={<VenueSetup />} />
        <Route path="/admin/rooms" element={<Rooms />} />
        <Route path="/admin/fnb" element={<FoodBeverage />} />
        <Route path="/admin/av" element={<AV />} />
        <Route path="/admin/labour" element={<Labour />} />
        <Route path="/admin/third-party" element={<ThirdParty />} />
      </Routes>
    </BrowserRouter>
  );
}
