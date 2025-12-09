import { useNotes } from "@/context/NoteContext";
import { useState } from "react";

function TopNav() {
  const {
    handleToggleViewer,
    handleToggleMenu,
    handleSaveNote,
    note,
    handleAddLabel,
    handleRemoveLabel,
    savingNote,
    isViewer,
  } = useNotes();

  const [labelVal, setLabelVal] = useState("");
  return (
    <>
      <div className="notes-btn">
        <button onClick={handleToggleMenu} className="card-button-primary menu">
          <i className="fa-solid fa-bars"></i>
        </button>
        <button
          onClick={handleSaveNote}
          disabled={savingNote}
          className="card-button-secondary"
        >
          <h6>{savingNote ? "Saving..." : "Save"}</h6>
          <i className="fa-solid fa-floppy-disk"></i>
        </button>
        <button className="card-button-secondary" onClick={handleToggleViewer}>
          {isViewer ? (
            <>
              <h6>Editor</h6>
              <i className="fa-solid fa-pencil"></i>
            </>
          ) : (
            <>
              <h6>Viewer</h6>
              <i className="fa-solid fa-check-double"></i>
            </>
          )}
        </button>
      </div>
      <div className="full-line"></div>
      <div className="label-area">
        <div className="label-input">
          <input
            id="label-input"
            name="input"
            type="text"
            placeholder="Add label...(Will only be saved after saving note)"
            value={labelVal}
            onChange={(e) => {
              setLabelVal(e.target.value);
            }}
          />
          <button
            onClick={() => {
              if (
                labelVal.trim() !== "" &&
                !note?.labels.includes(labelVal.trim())
              ) {
                setLabelVal("");
                handleAddLabel(labelVal.trim());
              } else {
                setLabelVal("");
              }
            }}
            className="card-button-primary"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
        <div className="label-buttons">
          {(note?.labels || []).map((label, labelidx) => {
            return (
              <button
                key={labelidx}
                onClick={() => {
                  handleRemoveLabel(label);
                }}
              >
                <span>
                  <p>
                    {label} <small>❌</small>
                  </p>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default TopNav;
