"use client";
import { auth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider(props) {
  const { children } = props;
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function signin(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signout() {
    setCurrentUser(null);
    return signOut(auth);
  }

  function resetpassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setIsLoadingUser(true);
        if (!user) {
          throw Error("No user found");
        }
        setCurrentUser(user);
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoadingUser(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isLoadingUser,
    signin,
    signout,
    signup,
    resetpassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
