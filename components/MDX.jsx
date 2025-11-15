import TopNav from "./TopNav";
import Markdown from "markdown-to-jsx";

function MDX(props) {
  const { text } = props;

  return (
    <section className="mdx-container">
      <TopNav {...props} />
      <article>
        <Markdown>
          {text.trim() || "Give your note some content from the editor!"}
        </Markdown>
      </article>
    </section>
  );
}

export default MDX;
