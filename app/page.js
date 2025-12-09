import Login from "@/components/Login";
import Image from "next/image";

export default function Home() {
  return (
    <main id="hero">
      <div className="hero-img">
        <Image alt="hero-img" width={2000} height={2000} src="/hero-img.jpeg" />
      </div>
      <div className="hero-login">
        <Login />
      </div>
    </main>
  );
}
