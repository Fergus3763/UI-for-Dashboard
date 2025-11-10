import { useEffect, useState } from "react";

function newVenue() {
  return {
    name: "",
    address: "",
    email: "",
    phone: "",
    main_image: null,
    more_images: [],
    notes: "",
  };
}

export default function VenueSetup() {
  const [venue, setVenue] = useState(newVenue());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [initialised, setInitialised] = useState(false);

  function setField(patch) {
    setVenue((v) => ({ ...v, ...patch }));
  }

  function validate(v) {
    const e = {};
    if (!v.name || !v.name.trim()) {
      e.name = "Venue name is required";
    }
    return e;
  }

  // Load existing config from Supabase on first mount
  useEffect(() => {
    let cancelled = false;

    async function doLoad() {
      try {
        const res = await fetch("/.netlify/functions/load_config", {
          method: "GET",
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (cancelled) return;

        if (json && json.data && json.data.venue) {
          setVenue({ ...newVenue(), ...json.data.venue });
        }
      } catch (err) {
        // Don't block UI if persistence fails; just log it.
        // eslint-disable-next-line no-console
        console.error("Failed to load venue config", err);
      } finally {
        if (!cancelled) setInitialised(true);
      }
    }

    doLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    const e = validate(venue);
    setErrors(e);
    setSaveMessage(null);

    if (Object.keys(e).length > 0) {
      return;
    }

    setSaving(true);
    try {
      const payload = { data: { venue } };
      const res = await fetch("/.netlify/functions/save_config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json && json.ok) {
        setSaveMessage("Saved to Supabase.");
      } else {
        setSaveMessage("Save completed, but response was unexpected.");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to save venue config", err);
      setSaveMessage("Error: could not save venue details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1>Venue Setup — Admin</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "0.4rem 0.9rem" }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </header>

      {!initialised && (
        <p style={{ marginBottom: "0.75rem", fontStyle: "italic" }}>
          Loading saved configuration…
        </p>
      )}

      {saveMessage && (
        <p style={{ marginBottom: "0.75rem" }}>
          <strong>{saveMessage}</strong>
        </p>
      )}

      <div
        style={{
          maxWidth: "900px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1.5rem",
        }}
      >
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Left column */}
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontWeight: 600 }}>
                Venue Name *
              </label>
              <input
                type="text"
                value={venue.name}
                onChange={(e) => setField({ name: e.target.value })}
                style={{ width: "100%", padding: "0.3rem" }}
                placeholder="e.g., Airport Business Park"
              />
              {errors.name && (
                <div style={{ color: "red", marginTop: "0.25rem" }}>
                  {errors.name}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontWeight: 600 }}>Phone</label>
              <input
                type="tel"
                value={venue.phone}
                onChange={(e) => setField({ phone: e.target.value })}
                style={{ width: "100%", padding: "0.3rem" }}
                placeholder="+353 1 234 5678"
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontWeight: 600 }}>
                Address
              </label>
              <textarea
                value={venue.address}
                onChange={(e) => setField({ address: e.target.value })}
                style={{ width: "100%", padding: "0.3rem" }}
                placeholder="Street, City, Postcode, Country"
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontWeight: 600 }}>Notes</label>
              <textarea
                value={venue.notes}
                onChange={(e) => setField({ notes: e.target.value })}
                style={{ width: "100%", padding: "0.3rem" }}
                placeholder="Optional administrative notes"
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{ padding: "0.4rem 0.9rem" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>

          {/* Right column */}
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontWeight: 600 }}>
                Contact Email
              </label>
              <input
                type="email"
                value={venue.email}
                onChange={(e) => setField({ email: e.target.value })}
                style={{ width: "100%", padding: "0.3rem" }}
                placeholder="e.g., sales@example.com"
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontWeight: 600 }}>
                Main Image
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setField({
                    main_image:
                      e.target.files && e.target.files[0]
                        ? e.target.files[0].name
                        : null,
                  })
                }
              />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontWeight: 600 }}>
                Add More Images
              </label>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setField({
                    more_images: e.target.files
                      ? Array.from(e.target.files).map((f) => f.name)
                      : [],
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
