import TopNav from "./TopNav";

function Editor(props) {
  const { text, setText } = props;

  return (
    <section className="notes-container">
      <TopNav {...props} />
      <textarea
        id="note-content"
        name="content"
        value={text}
        onChange={(e) => {
          setText(e);
        }}
        placeholder="There are 206 bones in the human body"
      />
    </section>
  );
}

export default Editor;
