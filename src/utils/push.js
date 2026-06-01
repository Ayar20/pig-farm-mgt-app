// Web Push Notification Helper Utility

export async function requestPushPermission(userEmail) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('Notifications or Service Worker not supported by browser.');
    return;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted:', permission);
      return;
    }
    
    const reg = await navigator.serviceWorker.ready;
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.error('VITE_VAPID_PUBLIC_KEY is not defined in the environment.');
      return;
    }
    
    // Subscribe the user to push
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });
    
    console.log('Push subscription generated successfully:', sub);
    
    // Send subscription to backend
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, subscription: sub }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to register subscription with server');
    }
    
    console.log('Push notification subscription registered successfully.');
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
  }
}

export async function unsubscribePush(userEmail) {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      console.log('Push manager subscription cancelled.');
    }
    
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail }),
    });
    
    console.log('Push notification unregistration completed.');
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
    
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
