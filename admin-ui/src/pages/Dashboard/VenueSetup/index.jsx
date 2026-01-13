// admin-ui/src/pages/Dashboard/VenueSetup/index.jsx

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminTabs from "../../../components/AdminTabs";
import BookingPolicyTab from "./Tabs/BookingPolicyTab";

const defaultVenue = {
  name: "",
  // address broken into separate fields for mapping
  addressLine1: "",
  townCity: "",
  region: "",
  country: "",
  postCode: "",
  email: "",
  phone: "",
  // images: 1 main + 3 additional
  main_image: "",
  more_images: ["", "", ""],
  // free text description
  notes: "",
};

const defaultBookingPolicy = {
  termsText: "",
  privacyStatement: "",
  // internally stored as minutes
  holdTimeMinutes: {
    small: 30, // minutes
    medium: 120, // 2 hours
    large: 1440, // 1 day
  },
  // description of what Small/Medium/Large means
  holdAttendees: {
    small: "",
    medium: "",
    large: "",
  },
  reservationFee: {
    enabled: false,
    percentage: 0,
    minimum: 0,
  },
  // general documents
  documents: [], // array of { title: string, url: string }
  // documents specifically linked to Terms text
  termsDocuments: [], // array of { title: string, url: string }
  // documents specifically linked to Privacy text
  privacyDocuments: [], // array of { title: string, url: string }
};

function normalizeDocuments(list) {
  if (!Array.isArray(list)) return [];
  return list.map((doc) => ({
    title: typeof doc?.title === "string" ? doc.title : "",
    url: typeof doc?.url === "string" ? doc.url : "",
  }));
}

function hydrateVenue(rawVenue) {
  if (!rawVenue || typeof rawVenue !== "object") {
    return { ...defaultVenue };
  }

  const merged = {
    ...defaultVenue,
    ...rawVenue,
  };

  // Backwards compatibility: if old single "address" field exists, use it as addressLine1 when empty
  if (!merged.addressLine1 && typeof rawVenue.address === "string") {
    merged.addressLine1 = rawVenue.address;
  }

  // Ensure more_images is always an array with at least 3 entries
  const more =
    Array.isArray(rawVenue.more_images) && rawVenue.more_images.length > 0
      ? rawVenue.more_images.slice(0, 3)
      : [];
  while (more.length < 3) {
    more.push("");
  }

  merged.more_images = more;
  merged.main_image =
    typeof rawVenue.main_image === "string" ? rawVenue.main_image : "";

  return merged;
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

  const attendeesSource =
    src.holdAttendees && typeof src.holdAttendees === "object"
      ? src.holdAttendees
      : {};

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
    holdAttendees: {
      small:
        typeof attendeesSource.small === "string"
          ? attendeesSource.small
          : defaultBookingPolicy.holdAttendees.small,
      medium:
        typeof attendeesSource.medium === "string"
          ? attendeesSource.medium
          : defaultBookingPolicy.holdAttendees.medium,
      large:
        typeof attendeesSource.large === "string"
          ? attendeesSource.large
          : defaultBookingPolicy.holdAttendees.large,
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
    documents: normalizeDocuments(src.documents),
    termsDocuments: normalizeDocuments(src.termsDocuments),
    privacyDocuments: normalizeDocuments(src.privacyDocuments),
  };
}

function ExplainerPanel({ expanded, onToggle, sections }) {
  return (
    <div
      style={{
        marginBottom: "1rem",
        borderRadius: 14,

        // ✅ Change #2: dashed border
        border: "1px dashed rgba(59, 130, 246, 0.22)",

        // (background unchanged per “no other changes”)
        background: "rgba(59, 130, 246, 0.06)",

        // ✅ Change #3: left blue accent bar
        borderLeft: "6px solid rgba(59, 130, 246, 0.55)",

        padding: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 17,
              lineHeight: "20px",
              fontWeight: 880,
              color: "rgba(30, 64, 175, 0.95)",

              // ✅ Change #1: italicise header title
              fontStyle: "italic",
            }}
          >
            Why this page exists
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              lineHeight: "16px",
              color: "rgba(17, 24, 39, 0.68)",
            }}
          >
            A short, self-guided explanation (read-only guidance).
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          style={{
            border: "1px solid rgba(59, 130, 246, 0.32)",
            background: "rgba(59, 130, 246, 0.10)",
            color: "rgba(30, 64, 175, 0.95)",
            borderRadius: 12,
            padding: "10px 12px",
            fontWeight: 820,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          aria-expanded={expanded}
        >
          {expanded ? "Collapse ▴" : "Expand ▾"}
        </button>
      </div>

      {expanded ? (
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {sections.map((s) => (
            <div key={s.heading}>
              <div style={{ fontWeight: 860, color: "rgba(17, 24, 39, 0.92)" }}>
                {s.heading}
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: "rgba(17, 24, 39, 0.70)",
                  lineHeight: "18px",
                }}
              >
                {s.body}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const VenueSetup = () => {
  const location = useLocation();

  const [venue, setVenue] = useState(defaultVenue);
  const [bookingPolicy, setBookingPolicy] = useState(defaultBookingPolicy);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [initialised, setInitialised] = useState(false);
  const [activeTab, setActiveTab] = useState("venue");

  // UI-only: collapsible explainers (collapsed by default; never disappear)
  const [venueExplainerExpanded, setVenueExplainerExpanded] = useState(false);
  const [bookingExplainerExpanded, setBookingExplainerExpanded] =
    useState(false);

  // ---------- Deep-linking via query string (UI/navigation only) ----------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewRaw = params.get("view");
    const view = typeof viewRaw === "string" ? viewRaw.toLowerCase() : "";

    if (!view) return;

    if (view === "venue") {
      setActiveTab("venue");
      return;
    }

    if (view === "terms" || view === "booking") {
      setActiveTab("booking");
    }
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      try {
        const res = await fetch("/.netlify/functions/load_config", {
          method: "GET",
        });

        if (!res.ok) {
          console.error("Failed to load config:", res.status, res.statusText);
        } else {
          const json = await res.json();
          const data = json?.data || {};

          const hydratedVenue = hydrateVenue(data.venue);
          const hydratedBooking = hydrateBookingPolicy(data.bookingPolicy);

          if (!cancelled) {
            setVenue(hydratedVenue);
            setBookingPolicy(hydratedBooking);
          }
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
        // ignore non-JSON response
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
    setVenue((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "name" && errors.name) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }
  };

  const handleMoreImageChange = (index, value) => {
    setVenue((prev) => {
      const nextMore = Array.isArray(prev.more_images)
        ? [...prev.more_images]
        : ["", "", ""];
      while (nextMore.length < 3) {
        nextMore.push("");
      }
      nextMore[index] = value;
      return {
        ...prev,
        more_images: nextMore,
      };
    });
  };

  const tabs = [
    {
      key: "venue",
      label: "Venue",
      content: (
        <div style={{ padding: "1rem" }}>
          <ExplainerPanel
            expanded={venueExplainerExpanded}
            onToggle={() => setVenueExplainerExpanded((v) => !v)}
            sections={[
              {
                heading: "Why this page exists",
                body: "This page captures the core identity of your venue — who you are, where you are, and how Booker should recognise you.",
              },
              {
                heading: "What data you configure here",
                body: "Your venue name, address, contact details, imagery, and descriptive information.",
              },
              {
                heading: "How this data is used",
                body: "This information is reused everywhere your venue appears — in room listings, previews, confirmations, and Booker-facing pages.",
              },
              {
                heading: "Why this matters",
                body: "By setting this once, you ensure every booking and preview reflects your venue accurately, without repeating work or manual corrections.",
              },
            ]}
          />

          {!initialised && (
            <p style={{ marginBottom: "0.5rem" }}>Loading configuration…</p>
          )}
          <h2>Venue details</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              doSave();
            }}
          >
            {/* Name */}
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

            {/* Address block */}
            <h3>Address</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="venue-address-line1"
                style={{ display: "block", fontWeight: "bold" }}
              >
                Address
              </label>
              <input
                id="venue-address-line1"
                type="text"
                value={venue.addressLine1}
                onChange={(e) =>
                  handleVenueChange("addressLine1", e.target.value || "")
                }
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label
                  htmlFor="venue-town-city"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Town / City
                </label>
                <input
                  id="venue-town-city"
                  type="text"
                  value={venue.townCity}
                  onChange={(e) =>
                    handleVenueChange("townCity", e.target.value || "")
                  }
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <div>
                <label
                  htmlFor="venue-region"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Region
                </label>
                <input
                  id="venue-region"
                  type="text"
                  value={venue.region}
                  onChange={(e) =>
                    handleVenueChange("region", e.target.value || "")
                  }
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label
                  htmlFor="venue-country"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Country
                </label>
                <input
                  id="venue-country"
                  type="text"
                  value={venue.country}
                  onChange={(e) =>
                    handleVenueChange("country", e.target.value || "")
                  }
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              <div>
                <label
                  htmlFor="venue-postcode"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Post Code
                </label>
                <input
                  id="venue-postcode"
                  type="text"
                  value={venue.postCode}
                  onChange={(e) =>
                    handleVenueChange("postCode", e.target.value || "")
                  }
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
            </div>

            {/* Contact details */}
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

            {/* Hotel description */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="venue-description"
                style={{ display: "block", fontWeight: "bold" }}
              >
                Hotel Description
              </label>
              <textarea
                id="venue-description"
                value={venue.notes}
                onChange={(e) =>
                  handleVenueChange("notes", e.target.value || "")
                }
                rows={4}
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>

            {/* Images */}
            <div style={{ marginBottom: "1rem" }}>
              <h3>Images</h3>
              <p style={{ fontSize: "0.9rem", color: "#555" }}>
                Enter URLs for up to four images. The first image will be used
                as the main image.
              </p>
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  htmlFor="venue-image-main"
                  style={{ display: "block", fontWeight: "bold" }}
                >
                  Image 1 (main)
                </label>
                <input
                  id="venue-image-main"
                  type="text"
                  value={venue.main_image || ""}
                  onChange={(e) =>
                    handleVenueChange("main_image", e.target.value || "")
                  }
                  style={{ width: "100%", padding: "0.5rem" }}
                />
              </div>
              {[0, 1, 2].map((index) => (
                <div style={{ marginBottom: "0.75rem" }} key={index}>
                  <label
                    htmlFor={`venue-image-${index + 2}`}
                    style={{ display: "block", fontWeight: "bold" }}
                  >
                    Image {index + 2}
                  </label>
                  <input
                    id={`venue-image-${index + 2}`}
                    type="text"
                    value={
                      Array.isArray(venue.more_images)
                        ? venue.more_images[index] || ""
                        : ""
                    }
                    onChange={(e) =>
                      handleMoreImageChange(index, e.target.value || "")
                    }
                    style={{ width: "100%", padding: "0.5rem" }}
                  />
                </div>
              ))}
            </div>

            {/* Save controls */}
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
        </div>
      ),
    },
    {
      key: "booking",
      label: "Booking Policy / Terms",
      content: (
        <div style={{ padding: "1rem" }}>
          <ExplainerPanel
            expanded={bookingExplainerExpanded}
            onToggle={() => setBookingExplainerExpanded((v) => !v)}
            sections={[
              {
                heading: "Why this page exists",
                body: "This page defines the rules under which bookings are accepted.",
              },
              {
                heading: "What data you configure here",
                body: "Your terms and conditions, privacy statement, documents, holding periods, and reservation policies.",
              },
              {
                heading: "How this data is used",
                body: "These rules are enforced consistently across simulations, previews, and future live bookings.",
              },
              {
                heading: "Why this matters",
                body: "Clear, centralised booking rules protect both you and the Booker — and prevent disputes later in the process.",
              },
            ]}
          />

          {!initialised && (
            <p style={{ marginBottom: "0.5rem" }}>Loading configuration…</p>
          )}
          <BookingPolicyTab
            bookingPolicy={bookingPolicy}
            onChange={setBookingPolicy}
            onSave={doSave}
            saving={saving}
            saveMessage={saveMessage}
          />
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
        activeKey={activeTab}
        value={activeTab}
        onTabChange={setActiveTab}
        onChange={setActiveTab}
        onValueChange={setActiveTab}
      />
    </div>
  );
};

export default VenueSetup;
