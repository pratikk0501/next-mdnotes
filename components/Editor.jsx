import { useNotes } from "@/context/NoteContext";
import TopNav from "./TopNav";

function Editor() {
  const { note, handleEditNote } = useNotes();

  return (
    <section className="notes-container">
      <TopNav />
      <textarea
        id="note-content"
        name="content"
        value={note.content}
        onChange={(e) => {
          handleEditNote(e);
        }}
        placeholder="There are 206 bones in the human body"
      />
    </section>
  );
}

export default Editor;
