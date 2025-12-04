import { useNotes } from "@/context/NoteContext";
import { useState } from "react";
import Modal from "./Modal";

export default function Filter(props) {
  const {
    labelList,
    setSelectedLabel,
    selectedLabel,
    searchQuery,
    setSearchQuery,
    selectedTime,
    setSelectedTime,
  } = props;
  const { handleCloseModal, showFilter, setShowFilter } = useNotes();
  const [isDefault, setIsDefault] = useState(true);
  const timeFilterList = [
    "Last hour",
    "Last 24 hours",
    "Last 7 days",
    "Last 30 days",
    "Last 12 months",
    "All time",
  ];

  function handleToggleDefault() {
    if (!isDefault) {
      setSelectedLabel("All");
      setSearchQuery("");
      setSelectedTime("All time");
      setIsDefault(true);
    }
  }

  return (
    <section className="filter-area">
      {isDefault ? (
        <button
          onClick={() => {
            setShowFilter(true);
            setIsDefault(false);
          }}
        >
          <i className="fa-solid fa-filter"></i>
        </button>
      ) : (
        <button onClick={handleToggleDefault}>
          <i className="fa-solid fa-arrow-rotate-right"></i>
        </button>
      )}
      {showFilter && (
        <Modal handleCloseModal={handleCloseModal}>
          <h6>Filter options</h6>
          <div className="text-filter">
            <p>Containing:</p>
            <input
              name="text-filter"
              id="text-filter"
              type="text"
              placeholder="Enter query..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
            />
          </div>
          <div className="label-time-filter">
            <div className="label-filter">
              <p>Label:</p>
              <select
                name="label-filter"
                id="label-filter"
                value={selectedLabel}
                onChange={(e) => {
                  setSelectedLabel(e.target.value);
                }}
              >
                {labelList.map((label, idx) => (
                  <option key={idx} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="time-filter">
              <p>Modified in:</p>
              <select
                name="time-filter"
                id="time-filter"
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                }}
              >
                {timeFilterList.map((timeFilter, idx) => (
                  <option key={idx} value={timeFilter}>
                    {timeFilter}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
