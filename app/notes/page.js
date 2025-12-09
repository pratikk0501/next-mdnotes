"use client";
import Editor from "@/components/Editor";
import MDX from "@/components/MDX";
import Modal from "@/components/Modal";
import SideNav from "@/components/SideNav";
import { useAuth } from "@/context/AuthContext";
import { NotesProvider } from "@/context/NoteContext";
import { db } from "@/firebase";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function NotesPage() {
  const [isViewer, setIsViewer] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [note, setNote] = useState({
    content: "",
  });
  const [notes, setNotes] = useState([]);
  const [savingNote, setSavingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [navRefreshKey, setNavRefreshKey] = useState(0);
  const [isDeleting, setIsDeleting] = useState({ id: null, display: false });
  const [loggingOut, setLoggingOut] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const { isLoadingUser, currentUser, signout } = useAuth();
  const searchParams = useSearchParams();

  function handleToggleViewer() {
    setIsViewer(!isViewer);
  }

  function handleToggleMenu() {
    setShowNav(!showNav);
  }

  function handleCreateNote() {
    setNote({
      content: "",
      labels: [],
    });
    setIsViewer(false);
    window.history.replaceState(null, "", "/notes");
  }

  function handleEditNote(e) {
    setNote({ ...note, content: e.target.value });
  }

  function handleAddLabel(label) {
    if (note.labels && note.labels.includes(label)) {
      return;
    }
    const updatedLabels = note.labels ? [...note.labels, label] : [label];
    setNote({ ...note, labels: updatedLabels });
  }

  function handleRemoveLabel(label) {
    if (!note.labels || !note.labels.includes(label)) {
      return;
    }
    const updatedLabels = note.labels.filter((lbl) => lbl !== label);
    setNote({ ...note, labels: updatedLabels });
  }

  function handleCloseModal() {
    setIsDeleting({ id: isDeleting.id, display: false });
    setLoggingOut(false);
    setShowFilter(false);
  }

  function fetchTimeRemaining(modifiedTime) {
    try {
      const lastDate = new Date(Number(modifiedTime));
      const deltaMs = Date.now() - lastDate.getTime();
      const seconds = Math.floor(deltaMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 10) return "Just now";
      if (seconds < 60) return `${seconds} seconds ago`;
      if (minutes < 60)
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
      if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
      return `${days} day${days === 1 ? "" : "s"} ago`;
    } catch (error) {
      console.error(error.message);
    }
  }

  async function deleteNote(noteIdx) {
    try {
      const noteRef = doc(db, "users", currentUser.uid, "notes", noteIdx);
      await deleteDoc(noteRef);
      setNotes((curr) => {
        return curr.filter((note) => note.id !== noteIdx);
      });
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsDeleting({ display: false });
      if (note.id === isDeleting.id) {
        setNote({ content: "", labels: [] });
      }
    }
  }

  async function handleSaveNote() {
    if (!note?.content) {
      return;
    }
    try {
      setSavingNote(true);
      if (note.id) {
        const noteRef = doc(db, "users", currentUser.uid, "notes", note.id);
        await setDoc(
          noteRef,
          { ...note, lastModified: Date.now() },
          { merge: true }
        );
      } else {
        const newId =
          note.content.replaceAll("#", "").slice(0, 15) + "__" + Date.now();
        const notesRef = doc(db, "users", currentUser.uid, "notes", newId);
        const newDocInfo = await setDoc(notesRef, {
          content: note.content,
          lastModified: Date.now(),
          labels: note.labels || [],
        });
        setNote({ ...note, id: newId });
        window.history.pushState(null, "", "/notes?id=" + newId);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setSavingNote(false);
      setNavRefreshKey((curr) => curr + 1);
    }
  }

  useEffect(() => {
    const value = searchParams.get("id");
    if (!value || !currentUser || isLoading) {
      return;
    }
    async function fetchNote() {
      try {
        setIsLoading(true);
        const noteRef = doc(db, "users", currentUser.uid, "notes", value);
        const snapshot = await getDoc(noteRef);
        const docData = snapshot.exists()
          ? { id: snapshot.id, ...snapshot.data() }
          : null;
        if (docData) {
          setNote({ ...docData });
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNote();
  }, [searchParams, currentUser]);

  if (isLoadingUser) {
    return <h6 className="text-gradient">Loading...</h6>;
  }

  if (!currentUser) {
    window.location.href = "/";
  }

  return (
    <NotesProvider
      value={{
        note,
        setNote,
        notes,
        setNotes,
        handleSaveNote,
        handleAddLabel,
        handleRemoveLabel,
        handleToggleViewer,
        handleToggleMenu,
        savingNote,
        isViewer,
        handleCreateNote,
        handleEditNote,
        handleCloseModal,
        showFilter,
        setShowFilter,
        navRefreshKey,
        setNavRefreshKey,
        fetchTimeRemaining,
      }}
    >
      <main id="notes">
        {isDeleting.display && (
          <Modal handleCloseModal={handleCloseModal}>
            <p>Are you sure you want to delete this note?</p>
            <div className="modal-actions">
              <button
                onClick={async () => {
                  await deleteNote(isDeleting.id);
                }}
              >
                Yes
              </button>
              <button onClick={handleCloseModal}>No</button>
            </div>
          </Modal>
        )}
        {loggingOut && (
          <Modal handleCloseModal={handleCloseModal}>
            <p>
              Are you sure you want to logout as &apos;{currentUser.email}
              &apos;?
            </p>
            <div className="modal-actions">
              <button onClick={signout}>Yes</button>
              <button onClick={handleCloseModal}>No</button>
            </div>
          </Modal>
        )}
        <SideNav
          showNav={showNav}
          setShowNav={setShowNav}
          setShowModal={setIsDeleting}
          setLoggingOut={setLoggingOut}
        />
        {isViewer ? <MDX /> : <Editor />}
      </main>
    </NotesProvider>
  );
}

export default NotesPage;
