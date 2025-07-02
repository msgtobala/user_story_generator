import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserStoryTemplate, Project, ProjectStory } from '../types';

// Template operations
export const createTemplate = async (template: Omit<UserStoryTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'templates'), {
    ...template,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateTemplate = async (id: string, template: Partial<UserStoryTemplate>) => {
  await updateDoc(doc(db, 'templates', id), {
    ...template,
    updatedAt: Timestamp.now()
  });
};

export const deleteTemplate = async (id: string) => {
  await deleteDoc(doc(db, 'templates', id));
};

export const getTemplates = async (): Promise<UserStoryTemplate[]> => {
  const q = query(collection(db, 'templates'), orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  })) as UserStoryTemplate[];
};

// Project operations
export const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'projects'), {
    ...project,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateProject = async (id: string, project: Partial<Project>) => {
  await updateDoc(doc(db, 'projects', id), {
    ...project,
    updatedAt: Timestamp.now()
  });
};

export const deleteProject = async (id: string) => {
  await deleteDoc(doc(db, 'projects', id));
};

export const getProjects = async (): Promise<Project[]> => {
  const q = query(collection(db, 'projects'), orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate()
  })) as Project[];
};