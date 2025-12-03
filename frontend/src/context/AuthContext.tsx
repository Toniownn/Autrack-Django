import {
  GoogleAuthProvider,
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";

interface IUserAuthProviderProps {
  children: React.ReactNode;
}

type AuthContextData = {
  user: User | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  logOut: () => Promise<void>;
  googleSignIn: () => Promise<any>;
};

const userAuthContext = createContext<AuthContextData>({
  user: null,
  loading: true,
  logIn: async () => {},
  signUp: async () => {},
  logOut: async () => {},
  googleSignIn: async () => {},
});

export const UserAuthProvider = ({ children }: IUserAuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  //Login using email and password
  // Uses Firebase's signInWithEmailAndPassword() to verify user credentials.
  // If correct, Firebase returns the logged-in user.
  const logIn = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const signUp = async (email: string, password: string, name: string) => {
    // Create user
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile to add the display name
    if (result.user) {
      await updateProfile(result.user, { displayName: name });
    }

    // Return user with updated name
    return result.user;
  };

  const logOut = () => signOut(auth);

  const googleSignIn = () => {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextData = {
    user,
    loading,
    logIn,
    signUp,
    logOut,
    googleSignIn,
  };

  return (
    <userAuthContext.Provider value={value}>
      {children}
    </userAuthContext.Provider>
  );
};

export const useUserAuth = () => useContext(userAuthContext);
