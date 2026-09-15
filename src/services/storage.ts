import { AgencyProfile } from '../types/agency';
import { SavedDocument } from '../types/documents';
import { defaultAgencyProfile } from './sampleData';

const AGENCY_PROFILE_KEY = 'agency_profile_v1';
const SAVED_DOCS_KEY = 'agency_documents_v1';

export const getAgencyProfile = (): AgencyProfile => {
  try {
    const saved = localStorage.getItem(AGENCY_PROFILE_KEY);
    if (saved) {
      const parsed: AgencyProfile = JSON.parse(saved);
      if (!parsed.signatureStore || !Array.isArray(parsed.signatureStore) || parsed.signatureStore.length === 0) {
        parsed.signatureStore = defaultAgencyProfile.signatureStore;
      }
      if (!parsed.primarySigner || parsed.primarySigner.name === 'Julian Vance') {
        parsed.primarySigner = defaultAgencyProfile.primarySigner;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading agency profile from storage', e);
  }
  return defaultAgencyProfile;
};

export const saveAgencyProfile = (profile: AgencyProfile): void => {
  try {
    localStorage.setItem(AGENCY_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving agency profile to storage', e);
  }
};

export const createDefaultInitialDocuments = (_agency?: AgencyProfile): SavedDocument[] => {
  return [];
};

export const getSavedDocuments = (): SavedDocument[] => {
  try {
    const saved = localStorage.getItem(SAVED_DOCS_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading documents from storage', e);
  }
  
  // Seed with initial template documents only on very first launch when key does not exist
  const initial = createDefaultInitialDocuments(getAgencyProfile());
  saveAllDocuments(initial);
  return initial;
};

export const clearAllDocuments = (): void => {
  try {
    localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Error clearing documents from storage', e);
  }
};

export const saveAllDocuments = (docs: SavedDocument[]): void => {
  try {
    localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error('Error saving documents to storage', e);
  }
};

export const getDocumentById = (id: string): SavedDocument | undefined => {
  const docs = getSavedDocuments();
  return docs.find(d => d.id === id);
};

export const saveDocument = (doc: SavedDocument): SavedDocument => {
  const docs = getSavedDocuments();
  const existingIdx = docs.findIndex(d => d.id === doc.id);
  const now = new Date().toISOString();
  
  const updatedDoc: SavedDocument = {
    ...doc,
    updatedAt: now
  };
  
  let newDocs: SavedDocument[];
  if (existingIdx >= 0) {
    newDocs = [...docs];
    newDocs[existingIdx] = updatedDoc;
  } else {
    newDocs = [updatedDoc, ...docs];
  }
  
  saveAllDocuments(newDocs);
  return updatedDoc;
};

export const deleteDocument = (id: string): void => {
  const docs = getSavedDocuments();
  const filtered = docs.filter(d => d.id !== id);
  saveAllDocuments(filtered);
};

export const duplicateDocument = (id: string): SavedDocument | null => {
  const doc = getDocumentById(id);
  if (!doc) return null;
  
  const now = new Date().toISOString();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newDoc: SavedDocument = {
    ...doc,
    id: `doc-${Date.now()}-${randomSuffix}`,
    title: `${doc.title} (Copy)`,
    docNumber: `${doc.docNumber}-COPY`,
    createdAt: now,
    updatedAt: now,
    status: 'draft'
  };
  
  saveDocument(newDoc);
  return newDoc;
};

export const exportAllData = (): string => {
  const data = {
    agencyProfile: getAgencyProfile(),
    documents: getSavedDocuments(),
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.agencyProfile) {
      saveAgencyProfile(parsed.agencyProfile);
    }
    if (Array.isArray(parsed.documents)) {
      saveAllDocuments(parsed.documents);
    }
    return true;
  } catch (e) {
    console.error('Failed to import data', e);
    return false;
  }
};
