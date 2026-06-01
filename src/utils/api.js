import { getCache, setCache, addToQueue, getQueue, removeFromQueue } from './db';

export async function apiFetch(endpoint) {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    // Cache the response
    await setCache(endpoint, data);
    return data;
  } catch (error) {
    console.warn(`Network fetch failed for ${endpoint}. Trying local cache...`, error);
    const cached = await getCache(endpoint);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

export async function apiPost(endpoint, bodyData) {
  // If we are online, attempt direct post
  if (navigator.onLine) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        const saved = await res.json();
        return { success: true, data: saved };
      }
    } catch (error) {
      console.warn('POST request failed on network error. Falling back to offline queue.', error);
    }
  }

  // Queue offline
  const queueItem = {
    endpoint,
    method: 'POST',
    data: bodyData,
    timestamp: Date.now()
  };
  await addToQueue(queueItem);

  // Optimistically cache it in the list view so it displays in the UI immediately
  const cachedList = await getCache(endpoint);
  if (Array.isArray(cachedList)) {
    const tempItem = { ...bodyData, id: -Date.now(), _offline: true };
    await setCache(endpoint, [tempItem, ...cachedList]);
  }

  return { success: true, offline: true, data: bodyData };
}

export async function syncOfflineQueue() {
  if (!navigator.onLine) return 0;
  const queue = await getQueue();
  if (queue.length === 0) return 0;

  console.log(`Syncing ${queue.length} offline operations...`);
  let syncedCount = 0;
  for (const item of queue) {
    try {
      const res = await fetch(item.endpoint, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      if (res.ok) {
        await removeFromQueue(item.id);
        syncedCount++;
      } else {
        console.warn(`Sync failed for item ${item.id} with status ${res.status}`);
      }
    } catch (error) {
      console.error(`Network error syncing queued item ${item.id}:`, error);
      break; // stop queue processing if network connection fails during loop
    }
  }

  if (syncedCount > 0) {
    console.log(`Successfully synchronized ${syncedCount} records.`);
    window.dispatchEvent(new CustomEvent('sync-completed', { detail: { count: syncedCount } }));
  }
  return syncedCount;
}

// Bind automatic network synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('Connectivity restored. Running background sync...');
    await syncOfflineQueue();
  });
}
