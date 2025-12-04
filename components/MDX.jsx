import { useNotes } from "@/context/NoteContext";
import TopNav from "./TopNav";
import Markdown from "markdown-to-jsx";

function MDX(props) {
  const { note } = useNotes();

  return (
    <section className="mdx-container">
      <TopNav />
      <article>
        <Markdown>
          {note.content.trim() ||
            "Give your note some content from the editor!"}
        </Markdown>
      </article>
    </section>
  );
}

export default MDX;
