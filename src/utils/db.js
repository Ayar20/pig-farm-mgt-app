const DB_NAME = 'PigFarmMgtDB';
const DB_VERSION = 1;

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('cached_data')) {
        db.createObjectStore('cached_data', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('offline_queue')) {
        db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function getCache(key) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('cached_data', 'readonly');
      const store = tx.objectStore('cached_data');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('IndexedDB getCache error:', error);
    return null;
  }
}

export async function setCache(key, value) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('cached_data', 'readwrite');
      const store = tx.objectStore('cached_data');
      store.put({ key, value, updated_at: Date.now() });
      tx.oncomplete = () => resolve(true);
    });
  } catch (error) {
    console.error('IndexedDB setCache error:', error);
    return false;
  }
}

export async function getQueue() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('offline_queue', 'readonly');
      const store = tx.objectStore('offline_queue');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (error) {
    console.error('IndexedDB getQueue error:', error);
    return [];
  }
}

export async function addToQueue(item) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('offline_queue', 'readwrite');
      const store = tx.objectStore('offline_queue');
      store.add(item);
      tx.oncomplete = () => resolve(true);
    });
  } catch (error) {
    console.error('IndexedDB addToQueue error:', error);
    return false;
  }
}

export async function removeFromQueue(id) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('offline_queue', 'readwrite');
      const store = tx.objectStore('offline_queue');
      store.delete(id);
      tx.oncomplete = () => resolve(true);
    });
  } catch (error) {
    console.error('IndexedDB removeFromQueue error:', error);
    return false;
  }
}
