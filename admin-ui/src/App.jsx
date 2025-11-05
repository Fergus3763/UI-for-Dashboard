import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Rooms from "./pages/Dashboard/Rooms/index.jsx";
import VenueSetup from "./pages/Dashboard/VenueSetup/index.jsx";
import FoodBeverage from "./pages/Dashboard/FoodBeverage/index.jsx";
import AV from "./pages/Dashboard/AV/index.jsx";
import Labour from "./pages/Dashboard/Labour/index.jsx";
import ThirdParty from "./pages/Dashboard/ThirdParty/index.jsx";
import AddOnsUpsells from "./pages/Dashboard/AddOnsUpsells/index.jsx";
import VAT from "./pages/Dashboard/VAT/index.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/venue" replace />} />
        <Route path="/admin/venue" element={<VenueSetup />} />
        <Route path="/admin/rooms" element={<Rooms />} />
        <Route path="/admin/fnb" element={<FoodBeverage />} />
        <Route path="/admin/av" element={<AV />} />
        <Route path="/admin/labour" element={<Labour />} />
        <Route path="/admin/third-party" element={<ThirdParty />} />
        <Route path="/admin/addons" element={<AddOnsUpsells />} />
        <Route path="/admin/vat" element={<VAT />} />
      </Routes>
    </BrowserRouter>
  );
}
