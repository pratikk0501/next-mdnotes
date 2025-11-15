"use client";
import Editor from "@/components/Editor";
import MDX from "@/components/MDX";
import Modal from "@/components/Modal";
import SideNav from "@/components/SideNav";
import { useAuth } from "@/context/AuthContext";
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
  const [noteIds, setNoteIds] = useState([]);
  const [savingNote, setSavingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState({ id: null, display: false });
  const { isLoadingUser, currentUser } = useAuth();
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
    });
    setIsViewer(false);
    window.history.replaceState(null, "", "/notes");
  }

  function handleEditNote(e) {
    setNote({ ...note, content: e.target.value });
  }

  function handleCloseModal() {
    setShowModal({ id: showModal.id, display: false });
  }

  async function deleteNote(noteIdx) {
    try {
      const noteRef = doc(db, "users", currentUser.uid, "notes", noteIdx);
      await deleteDoc(noteRef);
      setNoteIds((curr) => {
        return curr.filter((idx) => idx !== noteIdx);
      });
    } catch (error) {
      console.log(error.message);
    } finally {
      setShowModal({ display: false });
      if (note.id === showModal.id) {
        setNote({ content: "" });
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
        });
        setNoteIds((curr) => [...curr, newId]);
        setNote({ ...note, id: newId });
        window.history.pushState(null, "", "/notes?id=" + newId);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setSavingNote(false);
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
    <main id="notes">
      {showModal.display && (
        <Modal handleCloseModal={handleCloseModal}>
          <p>Are you sure you want to delete this note?</p>
          <div className="modal-actions">
            <button
              onClick={async () => {
                await deleteNote(showModal.id);
              }}
            >
              Yes
            </button>
            <button onClick={handleCloseModal}>No</button>
          </div>
        </Modal>
      )}
      <SideNav
        handleCreateNote={handleCreateNote}
        noteIds={noteIds}
        setNoteIds={setNoteIds}
        showNav={showNav}
        setShowNav={setShowNav}
        setIsViewer={setIsViewer}
        setShowModal={setShowModal}
      />
      {isViewer ? (
        <MDX
          isViewer={isViewer}
          text={note.content}
          handleToggleViewer={handleToggleViewer}
          handleToggleMenu={handleToggleMenu}
          handleSaveNote={handleSaveNote}
          savingNote={savingNote}
        />
      ) : (
        <Editor
          isViewer={isViewer}
          text={note.content}
          setText={handleEditNote}
          handleToggleViewer={handleToggleViewer}
          handleToggleMenu={handleToggleMenu}
          handleSaveNote={handleSaveNote}
          savingNote={savingNote}
        />
      )}
    </main>
  );
}

export default NotesPage;
