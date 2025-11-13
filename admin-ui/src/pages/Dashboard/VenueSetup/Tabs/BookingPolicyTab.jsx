// admin-ui/src/pages/Dashboard/VenueSetup/Tabs/BookingPolicyTab.jsx

import React from "react";

const BookingPolicyTab = ({
  bookingPolicy,
  onChange,
  onSave,
  saving,
  saveMessage,
}) => {
  const hold = bookingPolicy?.holdTimeMinutes || {};
  const attendees = bookingPolicy?.holdAttendees || {};
  const fee = bookingPolicy?.reservationFee || {};
  const documents = Array.isArray(bookingPolicy?.documents)
    ? bookingPolicy.documents
    : [];
  const termsDocuments = Array.isArray(bookingPolicy?.termsDocuments)
    ? bookingPolicy.termsDocuments
    : [];
  const privacyDocuments = Array.isArray(bookingPolicy?.privacyDocuments)
    ? bookingPolicy.privacyDocuments
    : [];

  const updateBookingPolicy = (update) => {
    onChange({
      ...bookingPolicy,
      ...update,
    });
  };

  // ----- Hold times helpers -----

  const safeNumber = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    const n = Number(value);
    if (Number.isNaN(n)) return "";
    return n;
  };

  // Stored as minutes; convert for display
  const smallMinutes =
    typeof hold.small === "number" ? hold.small : 0; // minutes
  const mediumHours =
    typeof hold.medium === "number" ? hold.medium / 60 : 0; // hours
  const largeDays =
    typeof hold.large === "number" ? hold.large / (60 * 24) : 0; // days

  const updateSmallMinutes = (value) => {
    const n = value === "" ? "" : Number(value);
    const minutes = n === "" || Number.isNaN(n) ? 0 : n;
    updateBookingPolicy({
      holdTimeMinutes: {
        small: minutes,
        medium: hold.medium ?? 0,
        large: hold.large ?? 0,
      },
    });
  };

  const updateMediumHours = (value) => {
    const n = value === "" ? "" : Number(value);
    const minutes = n === "" || Number.isNaN(n) ? 0 : n * 60;
    updateBookingPolicy({
      holdTimeMinutes: {
        small: hold.small ?? 0,
        medium: minutes,
        large: hold.large ?? 0,
      },
    });
  };

  const updateLargeDays = (value) => {
    const n = value === "" ? "" : Number(value);
    const minutes = n === "" || Number.isNaN(n) ? 0 : n * 60 * 24;
    updateBookingPolicy({
      holdTimeMinutes: {
        small: hold.small ?? 0,
        medium: hold.medium ?? 0,
        large: minutes,
      },
    });
  };

  const updateAttendees = (sizeKey, value) => {
    updateBookingPolicy({
      holdAttendees: {
        small: attendees.small || "",
        medium: attendees.medium || "",
        large: attendees.large || "",
        [sizeKey]: value,
      },
    });
  };

  // ----- Reservation fee helpers -----

  const updateReservationFee = (field, value) => {
    let nextValue = value;

    if (field === "percentage" || field === "minimum") {
      if (value === "") {
        nextValue = "";
      } else {
        const n = Number(value);
        nextValue = Number.isNaN(n) ? 0 : n;
      }
    }

    const nextFee = {
      enabled: !!fee.enabled,
      percentage: fee.percentage ?? 0,
      minimum: fee.minimum ?? 0,
      [field]: nextValue,
    };

    updateBookingPolicy({
      reservationFee: nextFee,
    });
  };

  const toggleReservationFee = () => {
    const nextEnabled = !fee.enabled;
    const nextFee = {
      enabled: nextEnabled,
      percentage: fee.percentage ?? 0,
      minimum: fee.minimum ?? 0,
    };
    updateBookingPolicy({
      reservationFee: nextFee,
    });
  };

  // ----- Document helpers (generic list) -----

  const updateDocumentList = (key, nextDocs) => {
    updateBookingPolicy({
      [key]: nextDocs,
    });
  };

  const handleDocumentChange = (key, docs, index, field, value) => {
    const nextDocs = docs.map((doc, i) =>
      i === index
        ? {
            ...doc,
            [field]: value,
          }
        : doc
    );
    updateDocumentList(key, nextDocs);
  };

  const addDocument = (key, docs) => {
    const nextDocs = [...docs, { title: "", url: "" }];
    updateDocumentList(key, nextDocs);
  };

  const removeDocument = (key, docs, index) => {
    const nextDocs = docs.filter((_, i) => i !== index);
    updateDocumentList(key, nextDocs);
  };

  return (
    <div>
      <h2>Booking policy &amp; terms</h2>

      {/* Terms & Conditions */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          htmlFor="booking-terms-text"
          style={{ display: "block", fontWeight: "bold" }}
        >
          Terms &amp; Conditions
        </label>
        <textarea
          id="booking-terms-text"
          rows={6}
          value={bookingPolicy.termsText || ""}
          onChange={(e) =>
            updateBookingPolicy({ termsText: e.target.value || "" })
          }
          style={{ width: "100%", padding: "0.5rem" }}
        />

        <h4 style={{ marginTop: "0.75rem" }}>Terms documents</h4>
        {termsDocuments.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            No documents attached to Terms yet.
          </p>
        )}
        {termsDocuments.map((doc, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr auto",
              gap: "0.5rem",
              marginBottom: "0.5rem",
              alignItems: "center",
            }}
          >
            <div>
              <label
                htmlFor={`terms-doc-title-${index}`}
                style={{ display: "block", fontWeight: "bold" }}
              >
                Title
              </label>
              <input
                id={`terms-doc-title-${index}`}
                type="text"
                value={doc.title || ""}
                onChange={(e) =>
                  handleDocumentChange(
                    "termsDocuments",
                    termsDocuments,
                    index,
                    "title",
                    e.target.value || ""
                  )
                }
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div>
              <label
                htmlFor={`terms-doc-url-${index}`}
                style={{ display: "block", fontWeight: "bold" }}
              >
                URL
              </label>
              <input
                id={`terms-doc-url-${index}`}
                type="url"
                value={doc.url || ""}
                onChange={(e) =>
                  handleDocumentChange(
                    "termsDocuments",
                    termsDocuments,
                    index,
                    "url",
                    e.target.value || ""
                  )
                }
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div style={{ marginTop: "1.4rem" }}>
              <button
                type="button"
                onClick={() =>
                  removeDocument("termsDocuments", termsDocuments, index)
                }
                style={{
                  padding: "0.4rem 0.75rem",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addDocument("termsDocuments", termsDocuments)}
          style={{
            padding: "0.5rem 1rem",
            marginTop: "0.5rem",
            cursor: "pointer",
          }}
        >
          {termsDocuments.length === 0
            ? "Add document"
            : "Add another document"}
        </button>
      </div>

      {/* Privacy Statement */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          htmlFor="booking-privacy-statement"
          style={{ display: "block", fontWeight: "bold" }}
        >
          Privacy statement (displayed to guests)
        </label>
        <textarea
          id="booking-privacy-statement"
          rows={4}
          value={bookingPolicy.privacyStatement || ""}
          onChange={(e) =>
            updateBookingPolicy({ privacyStatement: e.target.value || "" })
          }
          style={{ width: "100%", padding: "0.5rem" }}
        />

        <h4 style={{ marginTop: "0.75rem" }}>Privacy documents</h4>
        {privacyDocuments.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            No documents attached to Privacy statement yet.
          </p>
        )}
        {privacyDocuments.map((doc, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr auto",
              gap: "0.5rem",
              marginBottom: "0.5rem",
              alignItems: "center",
            }}
          >
            <div>
              <label
                htmlFor={`privacy-doc-title-${index}`}
                style={{ display: "block", fontWeight: "bold" }}
              >
                Title
              </label>
              <input
                id={`privacy-doc-title-${index}`}
                type="text"
                value={doc.title || ""}
                onChange={(e) =>
                  handleDocumentChange(
                    "privacyDocuments",
                    privacyDocuments,
                    index,
                    "title",
                    e.target.value || ""
                  )
                }
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div>
              <label
                htmlFor={`privacy-doc-url-${index}`}
                style={{ display: "block", fontWeight: "bold" }}
              >
                URL
              </label>
              <input
                id={`privacy-doc-url-${index}`}
                type="url"
                value={doc.url || ""}
                onChange={(e) =>
                  handleDocumentChange(
                    "privacyDocuments",
                    privacyDocuments,
                    index,
                    "url",
                    e.target.value || ""
                  )
                }
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div style={{ marginTop: "1.4rem" }}>
              <button
                type="button"
                onClick={() =>
                  removeDocument("privacyDocuments", privacyDocuments, index)
                }
                style={{
                  padding: "0.4rem 0.75rem",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addDocument("privacyDocuments", privacyDocuments)}
          style={{
            padding: "0.5rem 1rem",
            marginTop: "0.5rem",
            cursor: "pointer",
          }}
        >
          {privacyDocuments.length === 0
            ? "Add document"
            : "Add another document"}
        </button>
      </div>

      {/* Hold Times */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Hold Times</h3>
        <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "0.5rem" }}>
          Define what counts as Small, Medium and Large bookings, and how long
          each size is held before being released.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 2fr 1fr",
            gap: "0.5rem",
            alignItems: "center",
            fontWeight: "bold",
            marginBottom: "0.5rem",
          }}
        >
          <div>Size</div>
          <div>Attendees definition</div>
          <div>Hold time</div>
          <div>Unit</div>
        </div>

        {/* Small */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 2fr 1fr",
            gap: "0.5rem",
            marginBottom: "0.5rem",
            alignItems: "center",
          }}
        >
          <div>Small</div>
          <div>
            <input
              type="text"
              value={attendees.small || ""}
              onChange={(e) => updateAttendees("small", e.target.value || "")}
              placeholder="e.g. 1–4 attendees"
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div>
            <input
              type="number"
              min="0"
              value={safeNumber(smallMinutes)}
              onChange={(e) => updateSmallMinutes(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div>Minutes</div>
        </div>

        {/* Medium */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr 2fr 1fr",
            gap: "0.5rem",
            marginBottom: "0.5rem",
            alignItems: "center",
          }}
        >
          <div>Medium</div>
          <div>
            <input
              type="text"
              value={attendees.medium || ""}
              onChange={(e) => updateAttendees("medium", e.target.value || "")}
              placeholder="e.g. 5–10 attendees"
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div>
            <input
              type="number"
              min="0"
              value={safeNumber(mediumHours)}
              onChange={(e) => updateMediumHours(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div>Hours</div>
        </div>
