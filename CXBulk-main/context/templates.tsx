import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { DLTCategory } from '../constants/dlt-rules';

export interface DLTTemplate {
  id: string;
  userId: string;
  name: string;
  content: string;
  category: DLTCategory;
  type: 'Text' | 'Image+Text' | 'Text+CTA';
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  dltTemplateId: string;
  senderId: string;
  rejectionReason?: string;
  createdAt: number;
  updatedAt: number;
}

interface TemplateContextType {
  templates: DLTTemplate[];
  loading: boolean;
  addTemplate: (template: Omit<DLTTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<string>;
  updateTemplate: (id: string, updates: Partial<DLTTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  submitForApproval: (id: string) => Promise<void>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<DLTTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'templates'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const templateList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DLTTemplate[];
      
      setTemplates(templateList.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const addTemplate = async (templateData: Omit<DLTTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!auth.currentUser) throw new Error('User not authenticated');

    const now = Date.now();
    const docRef = await addDoc(collection(db, 'templates'), {
      ...templateData,
      userId: auth.currentUser.uid,
      status: 'Draft',
      createdAt: now,
      updatedAt: now,
    });

    return docRef.id;
  };

  const updateTemplate = async (id: string, updates: Partial<DLTTemplate>) => {
    const docRef = doc(db, 'templates', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  };

  const deleteTemplate = async (id: string) => {
    await deleteDoc(doc(db, 'templates', id));
  };

  const submitForApproval = async (id: string) => {
    await updateTemplate(id, { status: 'Pending' });
  };

  return (
    <TemplateContext.Provider value={{ 
      templates, 
      loading, 
      addTemplate, 
      updateTemplate, 
      deleteTemplate,
      submitForApproval
    }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplates() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
}
