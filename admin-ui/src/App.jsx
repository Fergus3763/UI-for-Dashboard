import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";

// Existing pages (keep your existing imports/paths if they differ)
import DashboardHome from "./pages/Dashboard";
import VenuePage from "./pages/Dashboard/Venue";
import RoomsPage from "./pages/Dashboard/Rooms";
import RoomOverviewPage from "./pages/Dashboard/RoomOverview";
import SimulationPage from "./pages/Dashboard/Simulation";

// NEW page
import BookerPreviewPage from "./pages/Dashboard/BookerPreview";

const linkStyle = ({ isActive }) => ({
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 8,
  fontWeight: 600,
  color: isActive ? "#111" : "#444",
  background: isActive ? "rgba(0,0,0,0.06)" : "transparent",
});

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Top Nav */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong style={{ fontSize: 16 }}>Admin</strong>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12, flexWrap: "wrap" }}>
            {/* Keep existing dropdown nav as-is (Venue ▾, Rooms ▾, Room Overview). */}

            <details style={{ position: "relative" }}>
              <summary style={{ cursor: "pointer", listStyle: "none", padding: "10px 12px", borderRadius: 8, fontWeight: 700 }}>
                Venue ▾
              </summary>
              <div
                style={{
                  position: "absolute",
                  top: 44,
                  left: 0,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 10,
                  padding: 8,
                  minWidth: 220,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.10)",
                  zIndex: 10,
                }}
              >
                <NavLink to="/admin/venue" style={linkStyle}>
                  Venue Setup
                </NavLink>
              </div>
            </details>

            <details style={{ position: "relative" }}>
              <summary style={{ cursor: "pointer", listStyle: "none", padding: "10px 12px", borderRadius: 8, fontWeight: 700 }}>
                Rooms ▾
              </summary>
              <div
                style={{
                  position: "absolute",
                  top: 44,
                  left: 0,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 10,
                  padding: 8,
                  minWidth: 220,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.10)",
                  zIndex: 10,
                }}
              >
                <NavLink to="/admin/rooms" style={linkStyle}>
                  Rooms Setup
                </NavLink>
              </div>
            </details>

            <NavLink to="/admin/room-overview" style={linkStyle}>
              Room Overview
            </NavLink>

            <NavLink to="/admin/simulation" style={linkStyle}>
              Simulation / Modelling
            </NavLink>

            {/* NEW top-level link */}
            <NavLink to="/admin/booker-preview" style={linkStyle}>
              Booker Preview
            </NavLink>
          </nav>
        </header>

        {/* Main */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Existing routes (do not remove/rename) */}
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<DashboardHome />} />
            <Route path="/admin/venue" element={<VenuePage />} />
            <Route path="/admin/rooms" element={<RoomsPage />} />
            <Route path="/admin/room-overview" element={<RoomOverviewPage />} />
            <Route path="/admin/simulation" element={<SimulationPage />} />

            {/* NEW route */}
            <Route path="/admin/booker-preview" element={<BookerPreviewPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
