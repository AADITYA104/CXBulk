import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { collection, addDoc, getDocs, query, orderBy, onSnapshot, writeBatch, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./auth";

export type Contact = {
  id: string;
  name: string;
  mobile: string;
  crop?: string;
  createdAt: number;
};

type ContactsContextType = {
  contacts: Contact[];
  isLoading: boolean;
  addContact: (name: string, mobile: string, crop?: string) => Promise<void>;
  importContacts: (contacts: { name: string; mobile: string; crop?: string }[]) => Promise<number>;
};

const ContactsContext = createContext<ContactsContextType | null>(null);

export function useContacts() {
  const context = useContext(ContactsContext);
  if (!context) {
    return {
      contacts: [],
      isLoading: true,
      addContact: async () => {},
      importContacts: async () => 0,
    };
  }
  return context;
}

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for contacts
  useEffect(() => {
    if (!user) {
      setContacts([]);
      setIsLoading(false);
      return;
    }

    const contactsRef = collection(db, "users", user.id, "contacts");
    const q = query(contactsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactList: Contact[] = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name || "",
        mobile: d.data().mobile || "",
        crop: d.data().crop || "",
        createdAt: d.data().createdAt || 0,
      }));
      setContacts(contactList);
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to contacts:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addContact = useCallback(async (name: string, mobile: string, crop?: string) => {
    if (!user) throw new Error("Not authenticated");

    // Basic validation
    const cleanName = name.trim();
    const cleanMobile = mobile.trim();
    if (!cleanName || !cleanMobile) throw new Error("Name and mobile are required");

    // Phone number format validation — must start with + and have 10-15 digits
    const phoneRegex = /^\+?\d{10,15}$/;
    const digitsOnly = cleanMobile.replace(/\s+/g, "");
    if (!phoneRegex.test(digitsOnly)) {
      throw new Error("Invalid phone number format");
    }

    const contactsRef = collection(db, "users", user.id, "contacts");
    await addDoc(contactsRef, {
      name: cleanName,
      mobile: digitsOnly,
      crop: crop?.trim() || "",
      createdAt: Date.now(),
    });
  }, [user]);

  const importContacts = useCallback(async (rows: { name: string; mobile: string; crop?: string }[]) => {
    if (!user) throw new Error("Not authenticated");
    if (rows.length === 0) throw new Error("No contacts to import");

    let imported = 0;
    const contactsRef = collection(db, "users", user.id, "contacts");

    // Use batched writes for performance (Firestore max 500 per batch)
    const batchSize = 450;
    for (let i = 0; i < rows.length; i += batchSize) {
      const chunk = rows.slice(i, i + batchSize);
      const batch = writeBatch(db);

      for (const row of chunk) {
        const cleanName = (row.name || "").trim();
        const cleanMobile = (row.mobile || "").trim().replace(/\s+/g, "");
        if (!cleanName || !cleanMobile) continue;

        const newDocRef = doc(contactsRef);
        batch.set(newDocRef, {
          name: cleanName,
          mobile: cleanMobile,
          crop: (row.crop || "").trim(),
          createdAt: Date.now(),
        });
        imported++;
      }

      await batch.commit();
    }

    return imported;
  }, [user]);

  return (
    <ContactsContext.Provider value={{ contacts, isLoading, addContact, importContacts }}>
      {children}
    </ContactsContext.Provider>
  );
}
