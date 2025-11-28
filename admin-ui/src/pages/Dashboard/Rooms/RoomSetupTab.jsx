// admin-ui/src/pages/Dashboard/Rooms/RoomSetupTab.jsx
import React, { useMemo, useState } from 'react';

// Simple helper to create a unique id for new rooms
const createRoomId = () =>
  `room_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const EMPTY_ROOM = {
  id: '',
  code: '',
  name: '',
  description: '',
  capacityMin: 1,
  capacityMax: 10,
  active: true,
  layoutPricing: [],
};

// Common layouts to make it easier for the admin
const DEFAULT_LAYOUT_OPTIONS = [
  { layoutCode: 'BOARDROOM', layoutLabel: 'Boardroom' },
  { layoutCode: 'CLASSROOM', layoutLabel: 'Classroom' },
  { layoutCode: 'THEATRE', layoutLabel: 'Theatre' },
  { layoutCode: 'INTERVIEW', layoutLabel: 'Interview' },
];

const RoomSetupTab = ({ rooms, onChangeRooms }) => {
  const [editingRoom, setEditingRoom] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Make sure each room always has layoutPricing as an array
  const normalisedRooms = useMemo(
    () =>
      (rooms || []).map((r) => ({
        ...r,
        layoutPricing: Array.isArray(r.layoutPricing) ? r.layoutPricing : [],
      })),
    [rooms]
  );

  const handleAddRoom = () => {
    setFormErrors({});
    setEditingRoom({
      ...EMPTY_ROOM,
      id: createRoomId(),
    });
  };

  const handleEditRoom = (room) => {
    setFormErrors({});
    setEditingRoom({
      ...EMPTY_ROOM,
      ...room,
      layoutPricing: Array.isArray(room.layoutPricing)
        ? room.layoutPricing
        : [],
    });
  };

  const handleDeleteRoom = (roomId) => {
    if (!window.confirm('Delete this room?')) return;
    const updated = normalisedRooms.filter((r) => r.id !== roomId);
    onChangeRooms(updated);
  };

  const handleChangeField = (field, value) => {
    setEditingRoom((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangeNumberField = (field, rawValue) => {
    const value = rawValue === '' ? '' : Number(rawValue);
    setEditingRoom((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleActive = () => {
    setEditingRoom((prev) => ({
      ...prev,
      active: !prev.active,
    }));
  };

  const handleAddLayoutPricing = () => {
    setEditingRoom((prev) => ({
      ...prev,
      layoutPricing: [
        ...prev.layoutPricing,
        {
          layoutCode: '',
          layoutLabel: '',
          perPerson: {
            perHour: null,
            halfDay: null,
            day: null,
          },
          perBooking: {
            perHour: null,
            halfDay: null,
            day: null,
          },
          comparisonRule: 'higher',
        },
      ],
    }));
  };

  const handleRemoveLayoutPricing = (index) => {
    setEditingRoom((prev) => ({
      ...prev,
      layoutPricing: prev.layoutPricing.filter((_, i) => i !== index),
    }));
  };

  const handleLayoutFieldChange = (index, path, value) => {
    setEditingRoom((prev) => {
      const lp = [...prev.layoutPricing];
      const item = { ...lp[index] };

      if (
        path === 'layoutCode' ||
        path === 'layoutLabel' ||
        path === 'comparisonRule'
      ) {
        item[path] = value;
      } else if (
        path.startsWith('perPerson.') ||
        path.startsWith('perBooking.')
      ) {
        const [group, key] = path.split('.');
        const currentGroup = { ...(item[group] || {}) };
        currentGroup[key] = value === '' ? null : Number(value);
        item[group] = currentGroup;
      }

      lp[index] = item;
      return {
        ...prev,
        layoutPricing: lp,
      };
    });
  };

  const validateRoom = (room) => {
    const errors = {};

    if (!room.code) errors.code = 'Room code is required.';
    if (!room.name) errors.name = 'Room name is required.';

    if (room.capacityMin === '' || room.capacityMin == null) {
      errors.capacityMin = 'Minimum capacity is required.';
    }
    if (room.capacityMax === '' || room.capacityMax == null) {
      errors.capacityMax = 'Maximum capacity is required.';
    }

    if (
      typeof room.capacityMin === 'number' &&
      typeof room.capacityMax === 'number' &&
      room.capacityMin > room.capacityMax
    ) {
      errors.capacityMax =
        'Maximum capacity must be greater than or equal to minimum capacity.';
    }

    // Room code must be unique within all rooms
    const codeClash = normalisedRooms.some(
      (r) => r.code === room.code && r.id !== room.id
    );
    if (codeClash) {
      errors.code = 'Room code must be unique.';
    }

    // Layout pricing validation: if any rate is set, code + label are needed
    room.layoutPricing.forEach((lp, index) => {
      const hasAnyRate =
        !!lp?.perPerson?.perHour ||
        !!lp?.perPerson?.halfDay ||
        !!lp?.perPerson?.day ||
        !!lp?.perBooking?.perHour ||
        !!lp?.perBooking?.halfDay ||
        !!lp?.perBooking?.day;

      if (hasAnyRate) {
        if (!lp.layoutCode) {
          errors[`layoutPricing_${index}_layoutCode`] =
            'Layout code is required when rates are set.';
        }
        if (!lp.layoutLabel) {
          errors[`layoutPricing_${index}_layoutLabel`] =
            'Layout label is required when rates are set.';
        }
      }
    });

    return errors;
  };

  const handleSaveRoom = () => {
    if (!editingRoom) return;

    const cleanedRoom = {
      ...editingRoom,
      layoutPricing: editingRoom.layoutPricing.map((lp) => ({
        ...lp,
        perPerson: lp.perPerson || {
          perHour: null,
          halfDay: null,
          day: null,
        },
        perBooking: lp.perBooking || {
          perHour: null,
          halfDay: null,
          day: null,
        },
        comparisonRule: lp.comparisonRule === 'lower' ? 'lower' : 'higher',
      })),
    };

    const errors = validateRoom(cleanedRoom);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const exists = normalisedRooms.find((r) => r.id === cleanedRoom.id);
    let updatedRooms;
    if (exists) {
      updatedRooms = normalisedRooms.map((r) =>
        r.id === cleanedRoom.id ? cleanedRoom : r
      );
    } else {
      updatedRooms = [...normalisedRooms, cleanedRoom];
    }

    onChangeRooms(updatedRooms);
    setEditingRoom(null);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditingRoom(null);
    setFormErrors({});
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleAddRoom}>Add Room</button>
      </div>

      {/* Rooms table */}
      <table className="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Capacity</th>
            <th>Active</th>
            <th>Layouts</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {normalisedRooms.map((room) => (
            <tr key={room.id}>
              <td>{room.code}</td>
              <td>{room.name}</td>
              <td>
                {room.capacityMin} – {room.capacityMax}
              </td>
              <td>{room.active ? 'Yes' : 'No'}</td>
              <td>{room.layoutPricing?.length || 0}</td>
              <td>
                <button onClick={() => handleEditRoom(room)}>Edit</button>
                <button onClick={() => handleDeleteRoom(room.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {normalisedRooms.length === 0 && (
            <tr>
              <td colSpan={6}>No rooms configured yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit / Create form */}
      {editingRoom && (
        <div className="room-edit-panel" style={{ marginTop: '2rem' }}>
          <h2>
            {normalisedRooms.some((r) => r.id === editingRoom.id)
              ? 'Edit Room'
              : 'New Room'}
          </h2>

          <div className="form-grid">
            <div className="form-field">
              <label>Room Code</label>
              <input
                type="text"
                value={editingRoom.code}
                onChange={(e) => handleChangeField('code', e.target.value)}
              />
              {formErrors.code && (
                <div className="error">{formErrors.code}</div>
              )}
            </div>

            <div className="form-field">
              <label>Room Name</label>
              <input
                type="text"
                value={editingRoom.name}
                onChange={(e) => handleChangeField('name', e.target.value)}
              />
              {formErrors.name && (
                <div className="error">{formErrors.name}</div>
              )}
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea
                value={editingRoom.description || ''}
                onChange={(e) =>
                  handleChangeField('description', e.target.value)
                }
              />
            </div>

            <div className="form-field">
              <label>Minimum Capacity</label>
              <input
                type="number"
                min="1"
                value={editingRoom.capacityMin}
                onChange={(e) =>
                  handleChangeNumberField('capacityMin', e.target.value)
                }
              />
              {formErrors.capacityMin && (
                <div className="error">{formErrors.capacityMin}</div>
              )}
            </div>

            <div className="form-field">
              <label>Maximum Capacity</label>
              <input
                type="number"
                min="1"
                value={editingRoom.capacityMax}
                onChange={(e) =>
                  handleChangeNumberField('capacityMax', e.target.value)
                }
              />
              {formErrors.capacityMax && (
                <div className="error">{formErrors.capacityMax}</div>
              )}
            </div>

            <div className="form-field">
              <label>Active</label>
              <input
                type="checkbox"
                checked={editingRoom.active}
                onChange={handleToggleActive}
              />
            </div>
          </div>

          {/* Layout pricing editor */}
          <h3 style={{ marginTop: '2rem' }}>Per-Layout Base Pricing</h3>
          <p>
            For each layout, you can set optional per-person rates and optional
            per-booking rates. The comparison rule only stores whether to use
            the higher or lower later on — it does not calculate pricing here.
          </p>

          {editingRoom.layoutPricing.map((lp, index) => {
            const layoutCodeError =
              formErrors[`layoutPricing_${index}_layoutCode`];
            const layoutLabelError =
              formErrors[`layoutPricing_${index}_layoutLabel`];

            return (
              <div
                key={index}
                className="layout-pricing-card"
                style={{
                  border: '1px solid #ccc',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <h4>Layout #{index + 1}</h4>
                  <button onClick={() => handleRemoveLayoutPricing(index)}>
                    Remove
                  </button>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Layout Code</label>
                    <input
                      list={`layout-code-options-${index}`}
                      type="text"
                      value={lp.layoutCode || ''}
                      onChange={(e) =>
                        handleLayoutFieldChange(
                          index,
                          'layoutCode',
                          e.target.value
                        )
                      }
                    />
                    <datalist id={`layout-code-options-${index}`}>
                      {DEFAULT_LAYOUT_OPTIONS.map((opt) => (
                        <option
                          key={opt.layoutCode}
                          value={opt.layoutCode}
                        />
                      ))}
                    </datalist>
                    {layoutCodeError && (
                      <div className="error">{layoutCodeError}</div>
                    )}
                  </div>

                  <div className="form-field">
                    <label>Layout Label</label>
                    <input
                      type="text"
                      value={lp.layoutLabel || ''}
                      onChange={(e) =>
                        handleLayoutFieldChange(
                          index,
                          'layoutLabel',
                          e.target.value
                        )
                      }
                    />
                    {layoutLabelError && (
                      <div className="error">{layoutLabelError}</div>
                    )}
                  </div>

                  <div className="form-field">
                    <label>Comparison Rule</label>
                    <select
                      value={lp.comparisonRule || 'higher'}
                      onChange={(e) =>
                        handleLayoutFieldChange(
                          index,
                          'comparisonRule',
                          e.target.value
                        )
                      }
                    >
                      <option value="higher">Whichever is higher</option>
                      <option value="lower">Whichever is lower</option>
                    </select>
                  </div>
                </div>

                <div className="layout-pricing-rates">
                  <h5>Per Person</h5>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Per Hour</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          lp.perPerson && lp.perPerson.perHour !== null
                            ? lp.perPerson.perHour
                            : ''
                        }
                        onChange={(e) =>
                          handleLayoutFieldChange(
                            index,
                            'perPerson.perHour',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Half Day</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          lp.perPerson && lp.perPerson.halfDay !== null
                            ? lp.perPerson.halfDay
                            : ''
                        }
                        onChange={(e) =>
                          handleLayoutFieldChange(
                            index,
                            'perPerson.halfDay',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Day</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          lp.perPerson && lp.perPerson.day !== null
                            ? lp.perPerson.day
                            : ''
                        }
                        onChange={(e) =>
                          handleLayoutFieldChange(
                            index,
                            'perPerson.day',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <h5 style={{ marginTop: '1rem' }}>Per Booking</h5>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Per Hour</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          lp.perBooking && lp.perBooking.perHour !== null
                            ? lp.perBooking.perHour
                            : ''
                        }
                        onChange={(e) =>
                          handleLayoutFieldChange(
                            index,
                            'perBooking.perHour',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Half Day</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          lp.perBooking && lp.perBooking.halfDay !== null
                            ? lp.perBooking.halfDay
                            : ''
                        }
                        onChange={(e) =>
                          handleLayoutFieldChange(
                            index,
                            'perBooking.halfDay',
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>Day</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          lp.perBooking && lp.perBooking.day !== null
                            ? lp.perBooking.day
                            : ''
                        }
                        onChange={(e) =>
                          handleLayoutFieldChange(
                            index,
                            'perBooking.day',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={handleAddLayoutPricing}>Add Layout Pricing</button>

          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={handleSaveRoom}>Save Room</button>
            <button
              onClick={handleCancelEdit}
              style={{ marginLeft: '0.5rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSetupTab;
