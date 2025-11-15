"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const cantAuth = !email.includes("@") || password.length < 8;

  const { signin, signup, resetpassword } = useAuth();

  async function handleAuthUser() {
    if (cantAuth) {
      return;
    }
    try {
      setIsAuthenticating(true);
      if (isRegistered) {
        await signin(email, password);
      } else {
        await signup(email, password);
      }
      router.push("/notes");
    } catch (err) {
      setMsg("❌" + err.message);
    } finally {
      setIsAuthenticating(false);
    }
  }

  return (
    <>
      <div className="login-container">
        <h1 className="text-gradient">MDNOTES</h1>
        <h2>Organized note taking made easy</h2>
        <p>
          Build your very own archive of easily navigated and indexed
          information and notes
        </p>
        <div className="full-line"></div>
        <h5>{isRegistered ? "Sign in" : "Create an account!"}</h5>
        {msg !== "" && <p>{msg}</p>}
        <div>
          <p>Email</p>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="text"
            placeholder="Enter your email here"
          />
        </div>
        <div>
          <p>Password</p>
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type="password"
            placeholder="Enter password"
          />
        </div>
        <button
          onClick={handleAuthUser}
          disabled={cantAuth || isAuthenticating}
          className="submit-btn"
        >
          <h6>{isAuthenticating ? "Fetching data..." : "Submit"}</h6>
        </button>
        <div className="secondary-btns-container">
          <small>
            {isRegistered
              ? "Don't have an account?"
              : "Already have an account?"}
          </small>
          <br />
          <button
            onClick={() => {
              setIsRegistered(!isRegistered);
            }}
            className="card-button-secondary"
          >
            <small>{isRegistered ? "Sign up" : "Sign in"}</small>
          </button>
          {isRegistered && (
            <button
              onClick={() => {
                setMsg("✅ Reset password email sent! Check spam folder too.");
                resetpassword(email);
              }}
              className="card-button-secondary"
            >
              <small>Forgot Password?</small>
            </button>
          )}
        </div>
        <div className="full-line"></div>
        <footer>
          <a target="_blank" href="https://www.github.com/pratikk0501">
            <img
              src="https://avatars.githubusercontent.com/u/155634731?v=4"
              alt="pfp"
            />
            <h5>@pratikk0501</h5>
            <i className="fa-brands fa-github"></i>
          </a>
        </footer>
      </div>
    </>
  );
}

export default Login;
