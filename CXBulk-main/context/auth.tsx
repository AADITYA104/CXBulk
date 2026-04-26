import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type Role = "superadmin" | "admin";

export type User = {
  id: string;
  email: string | null;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isLoading: true,
      signIn: async () => {},
      signUp: async () => {},
      signOut: async () => {}
    };
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role: Role = "admin";
          if (userDoc.exists()) {
            role = userDoc.data().role as Role || "admin";
          } else {
            await setDoc(userDocRef, { role: "admin", email: firebaseUser.email });
          }

          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            role: role
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Failsafe: If Firestore read/write fails due to unconfigured security rules,
          // still login the user with default 'admin' role so they don't get trapped.
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            role: "admin"
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
