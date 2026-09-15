import { ClientAccount } from '../types/client';

const CLIENTS_STORAGE_KEY = 'agency_clients_v1';

export const initialSampleClients: ClientAccount[] = [];

export const getStoredClients = (): ClientAccount[] => {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read clients from storage', e);
  }
  return [];
};

export const saveAllClients = (clients: ClientAccount[]): void => {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save clients to storage', e);
  }
};

export const saveClient = (client: ClientAccount): ClientAccount => {
  const list = getStoredClients();
  const idx = list.findIndex((c) => c.id === client.id);
  let updatedList: ClientAccount[];
  if (idx >= 0) {
    updatedList = [...list];
    updatedList[idx] = client;
  } else {
    updatedList = [client, ...list];
  }
  saveAllClients(updatedList);
  return client;
};

export const changeClientPassword = (clientId: string, newPassword: string): boolean => {
  const list = getStoredClients();
  const idx = list.findIndex((c) => c.id === clientId);
  if (idx === -1) return false;

  list[idx] = {
    ...list[idx],
    credentials: {
      ...list[idx].credentials,
      password: newPassword,
      temporaryPassword: undefined,
      mustChangePassword: false,
      lastLoginAt: new Date().toISOString()
    }
  };
  saveAllClients(list);
  return true;
};

export const resetClientPassword = (clientId: string): { newPassword: string; client: ClientAccount | null } => {
  const list = getStoredClients();
  const idx = list.findIndex((c) => c.id === clientId);
  if (idx === -1) return { newPassword: '', client: null };

  const words = ['Client', 'Summit', 'Apex', 'Horizon', 'Orbit', 'Pulse', 'Vanguard'];
  const symbols = ['!', '@', '#', '$'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const newPassword = `${word}-${num}${symbol}`;

  const updated: ClientAccount = {
    ...list[idx],
    credentials: {
      ...list[idx].credentials,
      temporaryPassword: newPassword,
      mustChangePassword: true,
      generatedAt: new Date().toISOString()
    }
  };
  list[idx] = updated;
  saveAllClients(list);
  return { newPassword, client: updated };
};

export const deleteClient = (id: string): void => {
  const list = getStoredClients().filter((c) => c.id !== id);
  saveAllClients(list);
};

export const shareDocumentWithClient = (clientId: string, documentId: string): boolean => {
  const list = getStoredClients();
  const client = list.find((c) => c.id === clientId);
  if (!client) return false;
  if (!client.sharedDocumentIds) {
    client.sharedDocumentIds = [];
  }
  if (!client.sharedDocumentIds.includes(documentId)) {
    client.sharedDocumentIds.push(documentId);
    saveAllClients(list);
  }
  return true;
};

export const unshareDocumentWithClient = (clientId: string, documentId: string): boolean => {
  const list = getStoredClients();
  const client = list.find((c) => c.id === clientId);
  if (!client || !client.sharedDocumentIds) return false;
  client.sharedDocumentIds = client.sharedDocumentIds.filter((id) => id !== documentId);
  saveAllClients(list);
  return true;
};


