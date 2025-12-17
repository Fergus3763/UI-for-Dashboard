import React, { useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";

// ✅ Real pages in this repo (as provided)
import VenueSetup from "./pages/Dashboard/VenueSetup";
import Rooms from "./pages/Dashboard/Rooms";
import RoomOverviewPage from "./pages/Dashboard/RoomOverview";
import SimulationPage from "./pages/Dashboard/Simulation";
import BookerPreviewPage from "./pages/Dashboard/BookerPreview";

const NAV_PILL = {
  fontFamily: "inherit",
  appearance: "none",
  padding: "10px 12px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 14,
  lineHeight: "18px",
  textDecoration: "none",
  border: "1px solid transparent",
  background: "transparent",
  color: "#444",
};

const NAV_PILL_ACTIVE = {
  color: "#1d4ed8",
  background: "rgba(59, 130, 246, 0.10)",
  border: "1px solid rgba(59, 130, 246, 0.22)",
};

const topLinkStyle = ({ isActive }) => ({
  ...NAV_PILL,
  ...(isActive ? NAV_PILL_ACTIVE : null),
});

const dropdownItemStyle = {
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 14,
  lineHeight: "18px",
  color: "#444",
  background: "transparent",
  display: "block",
};

function useCloseDropdownOnRouteChange(onClose) {
  const location = useLocation();
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);
}

function Dropdown({ label, children, isOpen, setIsOpen }) {
  const ref = useRef(null);

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [setIsOpen]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        style={{
          cursor: "pointer",
          ...NAV_PILL,
          ...(isOpen ? NAV_PILL_ACTIVE : null),
        }}
        aria-expanded={isOpen}
      >
        {label} ▾
      </button>

      {isOpen ? (
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 0,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 12,
            padding: 8,
            minWidth: 280,
            boxShadow: "0 6px 24px rgba(0,0,0,0.10)",
            zIndex: 10,
            display: "grid",
            gap: 4,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function AppShell() {
  const [venueOpen, setVenueOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);

  const closeAll = () => {
    setVenueOpen(false);
    setRoomsOpen(false);
  };

  useCloseDropdownOnRouteChange(closeAll);

  return (
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
          <span
            style={{
              ...NAV_PILL,
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "default",
            }}
          >
            Admin
          </span>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12, flexWrap: "wrap" }}>
          {/* Venue ▾ */}
          <Dropdown
            label="Venue"
            isOpen={venueOpen}
            setIsOpen={(v) => {
              setVenueOpen(v);
              if (v) setRoomsOpen(false);
            }}
          >
            <Link to="/admin/venue?view=venue" onClick={closeAll} style={dropdownItemStyle}>
              Venue Setup
            </Link>
            <Link to="/admin/venue?view=terms" onClick={closeAll} style={dropdownItemStyle}>
              Booking Policy / Terms
            </Link>
          </Dropdown>

          {/* Rooms ▾ */}
          <Dropdown
            label="Rooms"
            isOpen={roomsOpen}
            setIsOpen={(v) => {
              setRoomsOpen(v);
              if (v) setVenueOpen(false);
            }}
          >
            <Link to="/admin/rooms?view=room-setup" onClick={closeAll} style={dropdownItemStyle}>
              Rooms (Create / Edit)
            </Link>
            <Link to="/admin/rooms?view=addons-create" onClick={closeAll} style={dropdownItemStyle}>
              Add-Ons (Create / Edit)
            </Link>
            <Link to="/admin/rooms?view=addons-catalogue" onClick={closeAll} style={dropdownItemStyle}>
              Add-On Catalogue &amp; Assignment
            </Link>
          </Dropdown>

          {/* Direct top-level links */}
          <NavLink to="/admin/room-overview" style={topLinkStyle} onClick={closeAll}>
            Room Overview
          </NavLink>

          <NavLink to="/admin/simulation" style={topLinkStyle} onClick={closeAll}>
            Simulation / Modelling
          </NavLink>

          <NavLink to="/admin/booker-preview" style={topLinkStyle} onClick={closeAll}>
            Booker Preview
          </NavLink>
        </nav>
      </header>

      {/* Main */}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Base */}
          <Route path="/" element={<Navigate to="/admin/venue?view=venue" replace />} />

          {/* Required routes */}
          <Route path="/admin/venue" element={<VenueSetup />} />
          <Route path="/admin/rooms" element={<Rooms />} />
          <Route path="/admin/room-overview" element={<RoomOverviewPage />} />
          <Route path="/admin/simulation" element={<SimulationPage />} />
          <Route path="/admin/booker-preview" element={<BookerPreviewPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/venue?view=venue" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
