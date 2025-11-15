import { Suspense } from "react";

function NotesLayout(props) {
  const { children } = props;
  return (
    <>
      <Suspense fallback={<h6 className="text-gradient">Loading...</h6>}>
        {children}
      </Suspense>
    </>
  );
}

export default NotesLayout;
