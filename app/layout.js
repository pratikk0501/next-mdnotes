import AuthProvider from "@/context/AuthContext";
import "./globals.css";
import Head from "./head";
import "./styling.css";

export const metadata = {
  title: "MDNOTES | Handy Notes App",
  description: "Organized note taking made easy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head />
      <AuthProvider>
        <body>
          <div id="root">{children}</div>
          <div id="portal"></div>
        </body>
      </AuthProvider>
    </html>
  );
}
