import { useState } from "react";

function newFeature() {
  return { id: crypto.randomUUID(), label: "" };
}
function newLayout() {
  return { id: crypto.randomUUID(), type: "", capacity: "" };
}

const LAYOUT_TYPES = [
  "Boardroom",
  "U-Shape",
  "Classroom",
  "Theatre",
  "Cabaret",
  "Hollow Square",
];

export default function Rooms() {
  const [rooms, setRooms] = useState([
    {
      id: crypto.randomUUID(),
      name: "",
      mainImage: null,
      gallery: [],
      features: [newFeature()],
      layouts: [newLayout()],
    },
  ]);
  const [errors, setErrors] = useState({}); // { [roomId]: { name?:string, layouts?:string } }

  function setRoom(id, patch) {
    setRooms((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRoom() {
    setRooms((list) => [
      ...list,
      {
        id: crypto.randomUUID(),
        name: "",
        mainImage: null,
        gallery: [],
        features: [newFeature()],
        layouts: [newLayout()],
      },
    ]);
  }

  function deleteRoom(id) {
    setRooms((list) => list.filter((r) => r.id !== id));
    setErrors((e) => {
      const copy = { ...e };
      delete copy[id];
      return copy;
    });
  }

  function addFeature(roomId) {
    setRooms((list) =>
      list.map((r) =>
        r.id === roomId ? { ...r, features: [...r.features, newFeature()] } : r
      )
    );
  }

  function setFeature(roomId, featureId, label) {
    setRooms((list) =>
      list.map((r) =>
        r.id === roomId
          ? {
              ...r,
              features: r.features.map((f) =>
                f.id === featureId ? { ...f, label } : f
              ),
            }
          : r
      )
    );
  }

  function removeFeature(roomId, featureId) {
    setRooms((list) =>
      list.map((r) =>
        r.id === roomId
          ? { ...r, features: r.features.filter((f) => f.id !== featureId) }
          : r
      )
    );
  }

  function addLayout(roomId) {
    setRooms((list) =>
      list.map((r) =>
        r.id === roomId ? { ...r, layouts: [...r.layouts, newLayout()] } : r
      )
    );
  }

  function setLayout(roomId, layoutId, patch) {
    setRooms((list) =>
      list.map((r) =>
        r.id === roomId
          ? {
              ...r,
              layouts: r.layouts.map((l) =>
                l.id === layoutId ? { ...l, ...patch } : l
              ),
            }
          : r
      )
    );
  }

  function removeLayout(roomId, layoutId) {
    setRooms((list) =>
      list.map((r) =>
        r.id === roomId
          ? { ...r, layouts: r.layouts.filter((l) => l.id !== layoutId) }
          : r
      )
    );
  }

  function validateRoom(r) {
    const e = {};
    if (!r.name.trim()) e.name = "Room name is required";
    const validLayouts = r.layouts.filter(
      (l) => l.type && String(l.capacity).trim() !== ""
    );
    if (validLayouts.length === 0) {
      e.layouts = "Add at least one layout with capacity";
    }
    return e;
  }

  function saveRoom(roomId) {
    const r = rooms.find((x) => x.id === roomId);
    const e = validateRoom(r);
    setErrors((all) => ({ ...all, [roomId]: e }));
    if (Object.keys(e).length) return;

    // MVP: print payload; later this will POST to API
    const payload = {
      ...r,
      galleryCount: r.gallery?.length || 0,
      features: r.features.filter((f) => f.label.trim()),
      layouts: r.layouts
        .filter((l) => l.type && String(l.capacity).trim() !== "")
        .map((l) => ({ type: l.type, capacity: Number(l.capacity) })),
    };
    console.log("Rooms:SAVE_ONE", payload);
    alert(`Saved room: ${r.name || "(unnamed)"} (MVP stub — check console)`);
  }

  function saveAll() {
    const nextErrors = {};
    rooms.forEach((r) => {
      const e = validateRoom(r);
      if (Object.keys(e).length) nextErrors[r.id] = e;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = rooms.map((r) => ({
      name: r.name,
      features: r.features.filter((f) => f.label.trim()),
      layouts: r.layouts
        .filter((l) => l.type && String(l.capacity).trim() !== "")
        .map((l) => ({ type: l.type, capacity: Number(l.capacity) })),
      mainImage: r.mainImage ? { name: r.mainImage.name, size: r.mainImage.size } : null,
      galleryCount: r.gallery?.length || 0,
    }));
    console.log("Rooms:SAVE_ALL", payload);
    alert(`Saved ${rooms.length} room(s). (MVP stub — check console)`);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Rooms — Admin</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveAll}>Save All (Rooms)</button>
          <button onClick={addRoom}>Add Room</button>
        </div>
      </header>

      {rooms.map((r, idx) => {
        const e = errors[r.id] || {};
        return (
          <section key={r.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Room {idx + 1}</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => saveRoom(r.id)}>Save Room</button>
                <button type="button" onClick={() => deleteRoom(r.id)}>Delete</button>
              </div>
            </div>

            {/* Name */}
            <div style={row}>
              <label style={label}>Room Name *</label>
              <input
                type="text"
                value={r.name}
                onChange={(e) => setRoom(r.id, { name: e.target.value })}
                placeholder="e.g., Oak Suite"
              />
              {e.name && <p style={err}>{e.name}</p>}
            </div>

            {/* Images */}
            <div style={grid2}>
              <div>
                <label style={label}>Main Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRoom(r.id, { mainImage: e.target.files?.[0] ?? null })}
                />
                {r.mainImage && <p style={hint}>{r.mainImage.name}</p>}
              </div>
              <div>
                <label style={label}>Add More Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setRoom(r.id, { gallery: Array.from(e.target.files ?? []) })}
                />
                {r.gallery?.length > 0 && (
                  <p style={hint}>{r.gallery.length} file(s) selected</p>
                )}
              </div>
            </div>

            {/* Features */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>Room Features</h3>
                <button type="button" onClick={() => addFeature(r.id)}>Add another Feature</button>
              </div>
              {r.features.map((f) => (
                <div key={f.id} style={row}>
                  <input
                    type="text"
                    value={f.label}
                    onChange={(e) => setFeature(r.id, f.id, e.target.value)}
                    placeholder="e.g., Natural light"
                  />
                  <button type="button" onClick={() => removeFeature(r.id, f.id)}>Remove</button>
                </div>
              ))}
            </div>

            {/* Layouts */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>Layout Styles & Capacity *</h3>
                <button type="button" onClick={() => addLayout(r.id)}>Add another Layout</button>
              </div>

              {r.layouts.map((l) => (
                <div key={l.id} style={grid3}>
                  <div>
                    <label style={label}>Layout Type</label>
                    <select
                      value={l.type}
                      onChange={(e) => setLayout(r.id, l.id, { type: e.target.value })}
                    >
                      <option value="">Select…</option>
                      {LAYOUT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={label}>Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={l.capacity}
                      onChange={(e) => setLayout(r.id, l.id, { capacity: e.target.value })}
                      placeholder="e.g., 12"
                    />
                  </div>
                  <div style={{ alignSelf: "end" }}>
                    <button type="button" onClick={() => removeLayout(r.id, l.id)}>Remove</button>
                  </div>
                </div>
              ))}
              {e.layouts && <p style={err}>{e.layouts}</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

const card = {
  border: "1px solid #e5e7eb",
  padding: 16,
  borderRadius: 12,
  margin: "16px 0",
  background: "#fff",
};

const row = {
  display: "grid",
  gridTemplateColumns: "180px 1fr auto",
  alignItems: "center",
  gap: 12,
  margin: "10px 0",
};

const label = { fontWeight: 600 };
const err = { color: "#b91c1c", marginTop: 6 };
const hint = { color: "#6b7280", marginTop: 6 };

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 6,
};

const grid3 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: 12,
  marginTop: 8,
};

