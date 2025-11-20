import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import VenueSetup from "./pages/Dashboard/VenueSetup";
import Rooms from "./pages/Dashboard/Rooms";
import RoomOverview from "./pages/RoomOverview";
import AddonDB from "./pages/AddonDB";

function App() {
  return (
    <Router>
      <div>
        {/* Top-level Admin navigation */}
        <nav
          style={{
            display: "flex",
            gap: "1rem",
            padding: "0.75rem 1.5rem",
            borderBottom: "1px solid #ddd",
          }}
        >
          {/* Keep existing Venue and Rooms links exactly as before */}
          <Link to="/admin/venue">Venue</Link>
          <Link to="/admin/rooms">Rooms</Link>

          {/* New top-level tabs */}
          <Link to="/admin/room-overview">Room Overview</Link>
          <Link to="/admin/addon-db">Addon DB</Link>
        </nav>

        {/* Main content area */}
        <main style={{ padding: "1.5rem" }}>
          <Routes>
            {/* Existing routes (unchanged paths and elements) */}
            <Route path="/admin/venue" element={<VenueSetup />} />
            <Route path="/admin/rooms" element={<Rooms />} />

            {/* New routes for Room Overview and Addon DB */}
            <Route path="/admin/room-overview" element={<RoomOverview />} />
            <Route path="/admin/addon-db" element={<AddonDB />} />

            {/* Optional default route – can stay or be adjusted as needed */}
            <Route path="*" element={<VenueSetup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
