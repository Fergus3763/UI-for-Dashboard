// admin-ui/src/pages/Dashboard/Rooms/RoomImagesEditor.jsx

import React, { useRef, useState } from "react";

// NOTE: This mirrors the typical pattern used in AddOnsTab:
// - File input
// - Upload via Netlify function / storage helper
// - Store final URL only in config
//
// Align the upload logic (uploadImageFile) with the existing AddOnsTab
// implementation so both use the same backend endpoint / helper.

const MAX_IMAGES = 6;

const RoomImagesEditor = ({ images, onChange }) => {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const fileInputRef = useRef(null);

  const triggerAddFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (images.length >= MAX_IMAGES) return;

    setUploadingIndex(images.length);
    try {
      const url = await uploadImageFile(file);
      const next = [...images, url];
      onChange(next);
    } catch (err) {
      console.error("Error uploading image:", err);
      // Optional: surface UI error here
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleReplaceImage = async (index, file) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const url = await uploadImageFile(file);
      const next = images.map((img, i) => (i === index ? url : img));
      onChange(next);
    } catch (err) {
      console.error("Error replacing image:", err);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleReplaceClick = (index) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      handleReplaceImage(index, file);
    };
    input.click();
  };

  const handleRemoveImage = (index) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[newIndex];
    next[newIndex] = temp;
    onChange(next);
  };

  const handleManualUrlChange = (index, value) => {
    const next = images.map((img, i) => (i === index ? value : img));
    onChange(next);
  };

  return (
    <div className="room-images-editor">
      <div
        className="images-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        {images.map((url, index) => (
          <div
            key={index}
            className="image-card"
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "0.5rem",
            }}
          >
            <div
              style={{
                width: "100%",
                paddingBottom: "56.25%",
                position: "relative",
                marginBottom: "0.5rem",
                backgroundColor: "#f7f7f7",
              }}
            >
              {url && (
                <img
                  src={url}
                  alt={`Room ${index + 1}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
            <div className="form-group" style={{ marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "0.8rem" }}>Image URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => handleManualUrlChange(index, e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div
              className="image-actions"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.25rem",
                flexWrap: "wrap",
                fontSize: "0.8rem",
              }}
            >
              <button
                type="button"
                onClick={() => handleReplaceClick(index)}
                disabled={uploadingIndex === index}
              >
                {uploadingIndex === index ? "Uploading…" : "Replace"}
              </button>
              <button type="button" onClick={() => handleRemoveImage(index)}>
                Delete
              </button>
              <div style={{ marginLeft: "auto", display: "flex", gap: "0.25rem" }}>
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === images.length - 1}
                >
                  ↓
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      <button
        type="button"
        onClick={triggerAddFile}
        disabled={images.length >= MAX_IMAGES || uploadingIndex !== null}
      >
        {images.length >= MAX_IMAGES
          ? "Maximum 6 images reached"
          : uploadingIndex !== null
          ? "Uploading…"
          : "Add Image"}
      </button>
    </div>
  );
};

async function uploadImageFile(file) {
  // IMPORTANT:
  // Replace this implementation with the same helper used in AddOnsTab
  // so that uploads are handled consistently across the Admin UI.
  //
  // Example (adjust to match existing API):
  //
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   const res = await fetch("/.netlify/functions/upload_image", {
  //     method: "POST",
  //     body: formData,
  //   });
  //   const json = await res.json();
  //   return json.url;
  //
  // For now, we throw to force wiring this up before use in production.

  throw new Error(
    "uploadImageFile not wired. Please align with AddOnsTab upload implementation."
  );
}

export default RoomImagesEditor;
