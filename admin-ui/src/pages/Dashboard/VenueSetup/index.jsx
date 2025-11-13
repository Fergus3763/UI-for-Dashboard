// admin-ui/src/pages/Dashboard/VenueSetup/index.jsx

import React, { useEffect, useState } from "react";
import AdminTabs from "../../../components/AdminTabs";
import BookingPolicyTab from "./Tabs/BookingPolicyTab";

const defaultVenue = {
  name: "",
  address: "",
  email: "",
  phone: "",
  main_image: null,
  more_images: [],
  notes: "",
};

const defaultBookingPolicy = {
  termsText: "",
  privacyStatement: "",
  holdTimeMinutes: {
    small: 30,
    medium: 60,
    large: 120,
  },
  reservationFee: {
    enabled: false,
    percentage: 0,
    minimum: 0,
  },
  documents: [], // array of { title: string, url: string }
};

function hydrateVenue(rawVenue) {
  if (!rawVenue || typeof rawVenue !== "object") {
    return { ...defaultVenue };
  }
  return {
    ...defaultVenue,
    ...rawVenue,
  };
}

function hydrateBookingPolicy(rawBookingPolicy) {
  const src =
    rawBookingPolicy && typeof rawBookingPolicy === "object"
      ? rawBookingPolicy
      : {};

  const holdSource =
    src.holdTimeMinutes && typeof src.holdTimeMinutes === "object"
      ? src.holdTimeMinutes
      : {};

  const reservationSource =
    src.reservationFee && typeof src.reservationFee === "object"
      ? src.reservationFee
      : {};

  const documentsArray = Array.isArray(src.documents) ? src.documents : [];

  return {
    termsText:
      typeof src.termsText === "string"
        ? src.termsText
        : defaultBookingPolicy.termsText,
    privacyStatement:
      typeof src.privacyStatement === "string"
        ? src.privacyStatement
        : defaultBookingPolicy.privacyStatement,
    holdTimeMinutes: {
      small:
        typeof holdSource.small === "number"
          ? holdSource.small
          : defaultBookingPolicy.holdTimeMinutes.small,
      medium:
        typeof holdSource.medium === "number"
          ? holdSource.medium
          : defaultBookingPolicy.holdTimeMinutes.medium,
      large:
        typeof holdSource.large === "number"
          ? holdSource.large
          : defaultBookingPolicy.holdTimeMinutes.large,
    },
    reservationFee: {
      enabled:
        typeof reservationSource.enabled === "boolean"
          ? reservationSource.enabled
          : defaultBookingPolicy.reservationFee.enabled,
      percentage:
        typeof reservationSource.percentage === "number"
          ? reservationSource.percentage
          : defaultBookingPolicy.reservationFee.percentage,
      minimum:
        typeof reservationSource.minimum === "number"
          ? reservationSource.minimum
          : defaultBookingPolicy.reservationFee.minimum,
    },
    documents: documentsArray.map((doc) => ({
      title: typeof doc?.title === "string" ? doc.title : "",
      url: typeof doc?.url === "string" ? doc.url : "",
    })),
  };
}

const VenueSetup = () => {
  const [venue, setVenue] = useState(defaultVenue);
  const [bookingPolicy, setBookingPolicy] = useState(defaultBookingPolicy);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [initialised, setInitialised] = useState(false);
  const [activeTab, setActiveTab] = useState("venue");

  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      try {
        const res = await fetch("/.netlify/functions/load_config", {
          method: "GET",
        });

        if (!res.ok) {
          console.error("Failed to load config:", res.status, res.statusText);
          return;
        }

        const json = await res.json();
        const data = json?.data || {};

        const hydratedVenue = hydrateVenue(data.venue);
        const hydratedBooking = hydrateBookingPolicy(data.bookingPolicy);

        if (!cancelled) {
          setVenue(hydratedVenue);
          setBookingPolicy(hydratedBooking);
        }
      } catch (err) {
        console.error("Error loading config:", err);
      } finally {
        if (!cancelled) {
          setInitialised(true);
        }
      }
    };

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!venue.name || venue.name.trim() === "") {
      newErrors.name = "Venue name is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setActiveTab("venue");
      return false;
    }
    return true;
  };

  const doSave = async () => {
    setSaveMessage("");

    if (!validate()) {
      return;
    }

    const payload = {
      venue,
      bookingPolicy,
    };

    setSaving(true);

    try {
      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let json = null;
      try {
        json = await res.json();
      } catch (e) {
        // If response is not JSON, json stays null
      }

      if (res.ok) {
        if (json && json.ok === true) {
          setSaveMessage("Saved");
        } else {
          setSaveMessage("Save completed");
        }
      } else {
        console.error("Save failed with status:", res.status, res.statusText);
        setSaveMessage("Save failed");
      }
    } catch (err) {
      console.error("Error saving config:", err);
      setSaveMessage("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleVenueChange = (field, value) => {
    setVenue((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };
      return next;
    });

    if (field === "name" && errors.name) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }
  };

  const tabs = [
    {
      key: "venue",
      label: "Venue",
      content: (
        <div style={{ padding: "1rem" }}>
          <h2>Venue details</h2>
          {!initialised && <p>Loading...</p>}
          {initialised && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                doSave();
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="venue-name"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Name *
                </label>
                <input
                  id="venue-name"
                  type="text"
                  value={venue.name}
                  onChange={(e) =>
                    handleVenueChange("name", e.target.value || "")
                  }
                  style={{ width: "100%", padding: "0.5rem" }}
                />
                {errors.name && (
                  <div style={{ color: "red", marginTop: "0.25rem" }}>
                    {errors.name}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="venue-address"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Address
                </label>
                <input
                  id="venue-address"
                  type="text"
                  value={venue.address}
                  onChange={(e) =>
                    handleVenueChange("address", e.target.value || "")
                  }
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="venue-email"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Email
                </label>
                <input
                  id="venue-email"
                  type="email"
                  value={venue.email}
                  onChange={(e) =>
                    handleVenueChange("email", e.target.value || "")
                  }
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="venue-phone"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Phone
                </label>
                <input
                  id="venue-phone"
                  type="tel"
                  value={venue.phone}
                  onChange={(e) =>
                    handleVenueChange("phone", e.target.value || "")
                  }
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  htmlFor="venue-notes"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Notes
                </label>
                <textarea
                  id="venue-notes"
                  value={venue.notes}
                  onChange={(e) =>
                    handleVenueChange("notes", e.target.value || "")
                  }
                  rows={4}
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "0.5rem 1rem",
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                {saveMessage && (
                  <span style={{ fontSize: "0.9rem" }}>{saveMessage}</span>
                )}
              </div>
            </form>
          )}
        </div>
      ),
    },
    {
      key: "booking",
      label: "Booking Policy / Terms",
      content: (
        <div style={{ padding: "1rem" }}>
          {!initialised && <p>Loading...</p>}
          {initialised && (
            <BookingPolicyTab
              bookingPolicy={bookingPolicy}
              onChange={setBookingPolicy}
              onSave={doSave}
              saving={saving}
              saveMessage={saveMessage}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1>Venue setup</h1>
      <AdminTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default VenueSetup;
