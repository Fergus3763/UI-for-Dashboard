// admin-ui/src/App.jsx

import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import VenueSetup from "./pages/Dashboard/VenueSetup";
import Rooms from "./pages/Dashboard/Rooms";
import AddonDB from "./pages/AddonDB";
import RoomOverviewPage from "./pages/Dashboard/RoomOverview";

function App() {
  const [openDropdown, setOpenDropdown] = useState(null); // "VENUE" | "ROOMS" | null
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const navEl = navRef.current;
      if (!navEl) return;
      if (!navEl.contains(event.target)) setOpenDropdown(null);
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (key) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const closeDropdown = () => setOpenDropdown(null);

  const Dropdown = ({ label, dropdownKey, children }) => {
    const isOpen = openDropdown === dropdownKey;

    return (
      <div style={{ position: "relative", display: "inline-flex" }}>
        <button
          type="button"
          onClick={() => toggleDropdown(dropdownKey)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
            font: "inherit",
          }}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          {label} ▾
        </button>

        {isOpen && (
          <div
            role="menu"
            style={{
              position: "absolute",
              top: "calc(100% + 0.5rem)",
              left: 0,
              minWidth: "14rem",
              border: "1px solid #ddd",
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderRadius: "6px",
              padding: "0.35rem",
              zIndex: 1000,
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  };

  const DropdownItem = ({ to, children }) => {
    return (
      <Link
        to={to}
        onClick={closeDropdown}
        role="menuitem"
        style={{
          display: "block",
          padding: "0.5rem 0.6rem",
          borderRadius: "4px",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        {children}
      </Link>
    );
  };

  return (
    <Router>
      <div>
        {/* Top-level Admin navigation */}
        <nav
          ref={navRef}
          style={{
            display: "flex",
            gap: "1.25rem",
            alignItems: "center",
            padding: "0.75rem 1.5rem",
            borderBottom: "1px solid #ddd",
          }}
        >
          {/* Venue dropdown */}
          <Dropdown label="Venue" dropdownKey="VENUE">
            <DropdownItem to="/admin/venue">Venue</DropdownItem>
            <DropdownItem to="/admin/venue">Booking Policy / Terms</DropdownItem>
          </Dropdown>

          {/* Rooms dropdown */}
          <Dropdown label="Rooms" dropdownKey="ROOMS">
            <DropdownItem to="/admin/rooms?view=room-setup">
              Rooms (Create / Edit Rooms)
            </DropdownItem>
            <DropdownItem to="/admin/rooms?view=addons-create">
              Add-Ons (Create / Edit)
            </DropdownItem>
            <DropdownItem to="/admin/rooms?view=addons-catalogue">
              Add-On Catalogue &amp; Assignment
            </DropdownItem>
          </Dropdown>

          {/* Room Overview stays direct */}
          <Link to="/admin/room-overview" onClick={closeDropdown}>
            Room Overview
          </Link>

          {/* Addon DB nav link intentionally removed (route stays) */}
        </nav>

        {/* Main content area */}
        <main style={{ padding: "1.5rem" }}>
          <Routes>
            {/* Existing routes (unchanged paths and elements) */}
            <Route path="/admin/venue" element={<VenueSetup />} />
            <Route path="/admin/rooms" element={<Rooms />} />

            {/* Existing routes for Room Overview and Addon DB */}
            <Route path="/admin/room-overview" element={<RoomOverviewPage />} />
            <Route path="/admin/addon-db" element={<AddonDB />} />

            {/* Optional default route – can stay as is */}
            <Route path="*" element={<VenueSetup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
