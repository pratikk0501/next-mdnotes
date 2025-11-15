import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function SideNav(props) {
  const {
    showNav,
    setShowNav,
    handleCreateNote,
    noteIds,
    setNoteIds,
    setIsViewer,
    setShowModal,
  } = props;

  const router = useRouter();
  const ref = useRef();
  const { signout, currentUser } = useAuth();
  const [noteTimes, setNoteTimes] = useState({});

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
    if (!noteIds || noteIds.length === 0) {
      setNoteTimes({});
      return;
    }

    let mounted = true;

    (async () => {
      try {
        // fetch all times in parallel
        const pairs = await Promise.all(
          noteIds?.map(async (id) => {
            try {
              const time = await fetchTimeRemaining(id);
              return [id, time];
            } catch (err) {
              console.error("fetchTimeRemaining for", id, err);
              return [id, null];
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
  }, [noteIds, currentUser, db]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    async function fetchIndexes() {
      try {
        const notesRef = collection(db, "users", currentUser.uid, "notes");
        const snapshot = await getDocs(notesRef);
        const notesIdxs = snapshot.docs.map((doc) => {
          return doc.id;
        });

        setNoteIds(notesIdxs);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchIndexes();
  }, []);

  return (
    <section ref={ref} className={"nav " + (showNav ? "" : "hidden-nav")}>
      <h1 className="text-gradient">MDNOTES</h1>
      <h5>Handy Notes App</h5>
      <div className="full-line"></div>
      <button onClick={handleCreateNote}>
        <h6>New Note</h6>
        <i className="fa-solid fa-plus"></i>
      </button>
      <div className="notes-list">
        {noteIds.length == 0 ? (
          <p>You have 0 notes</p>
        ) : (
          noteIds.map((note, idx) => {
            const [n, _] = note.split("__");
            const timeSince = noteTimes[note];
            return (
              <button
                key={idx}
                onClick={() => {
                  setIsViewer(true);
                  router.push("/notes?id=" + note);
                }}
                className="card-button-secondary list-btn"
              >
                <p>{n}</p>
                <small>{timeSince}</small>
                <div
                  onClick={async (event) => {
                    event.stopPropagation();
                    setShowModal({ id: note, display: true });
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
      <button onClick={signout}>
        <h6>Sign out</h6>
        <i className="fa-solid fa-arrow-right-from-bracket"></i>
      </button>
    </section>
  );
}

export default SideNav;
