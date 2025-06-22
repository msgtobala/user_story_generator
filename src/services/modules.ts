import { 
  updateDoc, 
  doc, 
  getDoc,
  setDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const getModules = async (): Promise<string[]> => {
  try {
    const docRef = doc(db, 'modules', 'data');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.moduleName && Array.isArray(data.moduleName)) {
        return data.moduleName.sort();
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching modules:', error);
    return [];
  }
};

export const addModule = async (moduleName: string): Promise<void> => {
  try {
    const docRef = doc(db, 'modules', 'data');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Document exists, update the moduleName array
      const currentData = docSnap.data();
      const currentModules = currentData.moduleName || [];
      
      // Add new module if it doesn't exist
      if (!currentModules.includes(moduleName)) {
        await updateDoc(docRef, {
          moduleName: [...currentModules, moduleName].sort(),
          updatedAt: Timestamp.now()
        });
      }
    } else {
      // Document doesn't exist, create it
      await setDoc(docRef, {
        moduleName: [moduleName],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error adding module:', error);
    throw error;
  }
};