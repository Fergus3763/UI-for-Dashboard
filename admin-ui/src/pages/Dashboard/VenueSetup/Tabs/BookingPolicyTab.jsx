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
  const fee = bookingPolicy?.reservationFee || {};
  const documents = Array.isArray(bookingPolicy?.documents)
    ? bookingPolicy.documents
    : [];

  const updateBookingPolicy = (update) => {
    onChange({
      ...bookingPolicy,
      ...update,
    });
  };

  const updateHoldTime = (sizeKey, value) => {
    const parsed =
      value === "" ? "" : Number.isNaN(Number(value)) ? 0 : Number(value);
    const nextHold = {
      small:
        hold.small !== undefined ? hold.small : bookingPolicy?.holdTimeMinutes?.small ?? 30,
      medium:
        hold.medium !== undefined ? hold.medium : bookingPolicy?.holdTimeMinutes?.medium ?? 60,
      large:
        hold.large !== undefined ? hold.large : bookingPolicy?.holdTimeMinutes?.large ?? 120,
    };
    nextHold[sizeKey] = parsed === "" ? "" : parsed;

    updateBookingPolicy({
      holdTimeMinutes: nextHold,
    });
  };

  const updateReservationFee = (field, value) => {
    let nextValue = value;

    if (field === "percentage" || field === "minimum") {
      nextValue =
        value === "" ? "" : Number.isNaN(Number(value)) ? 0 : Number(value);
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

  const handleDocumentChange = (index, field, value) => {
    const nextDocs = documents.map((doc, i) =>
      i === index
        ? {
            ...doc,
            [field]: value,
          }
        : doc
    );
    updateBookingPolicy({
      documents: nextDocs,
    });
  };

  const addDocument = () => {
    const nextDocs = [...documents, { title: "", url: "" }];
    updateBookingPolicy({
      documents: nextDocs,
    });
  };

  const removeDocument = (index) => {
    const nextDocs = documents.filter((_, i) => i !== index);
    updateBookingPolicy({
      documents: nextDocs,
    });
  };

  return (
    <div>
      <h2>Booking policy &amp; terms</h2>

      {/* Terms & Conditions */}
      <div style={{ marginBottom: "1rem" }}>
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
      </div>

      {/* Privacy Statement */}
      <div style={{ marginBottom: "1rem" }}>
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
      </div>

      {/* Hold Times */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Hold times (minutes)</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0.75rem",
            maxWidth: "500px",
          }}
        >
          <div>
            <label
              htmlFor="hold-small"
              style={{ display: "block", fontWeight: "bold" }}
            >
              Small
            </label>
            <input
              id="hold-small"
              type="number"
              min="0"
              value={hold.small === "" ? "" : hold.small ?? 30}
              onChange={(e) => updateHoldTime("small", e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div>
            <label
              htmlFor="hold-medium"
              style={{ display: "block", fontWeight: "bold" }}
            >
              Medium
            </label>
            <input
              id="hold-medium"
              type="number"
              min="0"
              value={hold.medium === "" ? "" : hold.medium ?? 60}
              onChange={(e) => updateHoldTime("medium", e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div>
            <label
              htmlFor="hold-large"
              style={{ display: "block", fontWeight: "bold" }}
            >
              Large
            </label>
            <input
              id="hold-large"
              type="number"
              min="0"
              value={hold.large === "" ? "" : hold.large ?? 120}
              onChange={(e) => updateHoldTime("large", e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
        </div>
      </div>

      {/* Reservation Fee */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Reservation fee</h3>
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={{ display: "inline-flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={!!fee.enabled}
              onChange={toggleReservationFee}
              style={{ marginRight: "0.5rem" }}
            />
            Enable reservation fee
          </label>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            maxWidth: "400px",
          }}
        >
          <div>
            <label
              htmlFor="reservation-percentage"
              style={{ display: "block", fontWeight: "bold" }}
            >
              Percentage (%)
            </label>
            <input
              id="reservation-percentage"
              type="number"
              min="0"
              value={fee.percentage === "" ? "" : fee.percentage ?? 0}
              disabled={!fee.enabled}
              onChange={(e) =>
                updateReservationFee("percentage", e.target.value)
              }
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div>
            <label
              htmlFor="reservation-minimum"
              style={{ display: "block", fontWeight: "bold" }}
            >
              Minimum amount
            </label>
            <input
              id="reservation-minimum"
              type="number"
              min="0"
              value={fee.minimum === "" ? "" : fee.minimum ?? 0}
              disabled={!fee.enabled}
              onChange={(e) => updateReservationFee("minimum", e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Documents</h3>
        {documents.length === 0 && (
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            No documents added yet.
          </p>
        )}
        {documents.map((doc, index) => (
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
                htmlFor={`doc-title-${index}`}
                style={{ display: "block", fontWeight: "bold" }}
              >
                Title
              </label>
              <input
                id={`doc-title-${index}`}
                type="text"
                value={doc.title || ""}
                onChange={(e) =>
                  handleDocumentChange(index, "title", e.target.value || "")
                }
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div>
              <label
                htmlFor={`doc-url-${index}`}
                style={{ display: "block", fontWeight: "bold" }}
              >
                URL
              </label>
              <input
                id={`doc-url-${index}`}
                type="url"
                value={doc.url || ""}
                onChange={(e) =>
                  handleDocumentChange(index, "url", e.target.value || "")
                }
                style={{ width: "100%", padding: "0.5rem" }}
              />
            </div>
            <div style={{ marginTop: "1.4rem" }}>
              <button
                type="button"
                onClick={() => removeDocument(index)}
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
          onClick={addDocument}
          style={{
            padding: "0.5rem 1rem",
            marginTop: "0.5rem",
            cursor: "pointer",
          }}
        >
          Add document
        </button>
      </div>

      {/* Save controls */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <button
          type="button"
          onClick={onSave}
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
    </div>
  );
};

export default BookingPolicyTab;
