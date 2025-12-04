import { useAuth } from "@/context/AuthContext";
import { useNotes } from "@/context/NoteContext";
import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function SideNav(props) {
  const { showNav, setShowNav, setShowModal, setLoggingOut } = props;
  const { currentUser } = useAuth();
  const { handleCreateNote, notes, setNotes, navRefreshKey } = useNotes();

  const router = useRouter();
  const ref = useRef();
  const [noteTimes, setNoteTimes] = useState({});
  const [labelList, setLabelList] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("All");
  const filteredList =
    selectedLabel === "All"
      ? notes
      : notes.filter((note) => note.labels.includes(selectedLabel));

  function formatTimeAgo(deltaMs) {
    const seconds = Math.floor(deltaMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  async function fetchTimeRemaining(note) {
    try {
      const noteRef = doc(db, "users", currentUser.uid, "notes", note);
      const lastModified = await getDoc(noteRef);
      const lastModifiedData = lastModified.data().lastModified;
      const lastDate = new Date(Number(lastModifiedData));

      return formatTimeAgo(Date.now() - lastDate.getTime());
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowNav(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;
    if (!notes || notes.length === 0) {
      setNoteTimes({});
      return;
    }

    let mounted = true;

    (async () => {
      try {
        // fetch all times in parallel
        const pairs = await Promise.all(
          notes?.map(async (note) => {
            try {
              const time = await fetchTimeRemaining(note.id);
              return [note.id, time];
            } catch (err) {
              console.error("fetchTimeRemaining for", note.id, err);
              return [note.id, null];
            }
          })
        );

        if (!mounted) return;
        const map = Object.fromEntries(pairs);
        setNoteTimes(map); // set all at once — fewer re-renders
      } catch (err) {
        console.error("bulk fetch error:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [notes, currentUser, db]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    async function fetchNotes() {
      try {
        const notesRef = collection(db, "users", currentUser.uid, "notes");
        const snapshot = await getDocs(notesRef);
        const notesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          content: doc.data().content || "",
          labels: doc.data().labels || [],
        }));
        const notesLabels = notesData.flatMap((doc) => {
          return doc.labels;
        });
        const uniqueLabels = Array.from(new Set(notesLabels));
        uniqueLabels.push("All");
        uniqueLabels.sort();

        setLabelList(uniqueLabels);
        setNotes(notesData);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchNotes();
  }, [navRefreshKey, currentUser]);

  return (
    <section ref={ref} className={"nav " + (showNav ? "" : "hidden-nav")}>
      <h1 className="text-gradient">MDNOTES</h1>
      <h5>Handy Notes App</h5>
      <div className="full-line"></div>
      <button onClick={handleCreateNote}>
        <h6>New Note</h6>
        <i className="fa-solid fa-plus"></i>
      </button>
      <div className="label-filter">
        <p>Filter by:</p>
        <select
          name="label-filter"
          id="filter"
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
      <div className="notes-list">
        {notes.length == 0 ? (
          <p>You have 0 notes</p>
        ) : (
          filteredList.map((note) => {
            const timeSince = noteTimes[note.id];
            return (
              <button
                key={note.id}
                onClick={() => {
                  router.push("/notes?id=" + note.id);
                }}
                className="card-button-secondary list-btn"
              >
                <p>{note?.content.replaceAll("#", "").slice(0, 15)}</p>
                <small>{timeSince}</small>
                <div
                  onClick={async (event) => {
                    setShowModal({ display: false });
                    event.stopPropagation();
                    setShowModal({ id: note.id, display: true });
                  }}
                  className="delete-btn"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </div>
              </button>
            );
          })
        )}
      </div>
      <div className="full-line"></div>
      <button onClick={() => setLoggingOut(true)}>
        <h6>Sign out</h6>
        <i className="fa-solid fa-arrow-right-from-bracket"></i>
      </button>
    </section>
  );
}

export default SideNav;
