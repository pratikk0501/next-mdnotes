import { createContext, useContext, useMemo } from "react";

const NotesContext = createContext(null);

export function NotesProvider({ children, value }) {
  const memo = useMemo(() => value, [value]);
  return <NotesContext.Provider value={memo}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  return useContext(NotesContext);
}
