export const registerNotification = async (): Promise<string | null> => {
  try {
    const vapidKey = window.$firebaseConfig?.vapidKey;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }
    const { firebaseApp } = await import('./firebase-app');
    const { getMessaging, getToken } = await import('firebase/messaging');
    const messaging = getMessaging(firebaseApp);
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    if (token) {
      console.log('FCM token:', token);
      return token;
    }
    console.warn('Failed to get FCM token');
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const setupForegroundListener = async (
  callback: (payload: any) => void,
): Promise<void> => {
  if (import.meta.env.SSR) return;
  if (Notification.permission !== 'granted') return;
  try {
    const { firebaseApp } = await import('./firebase-app');
    const { getMessaging, onMessage } = await import('firebase/messaging');
    const messaging = getMessaging(firebaseApp);
    onMessage(messaging, callback);
  } catch (error) {
    console.error('Error setting up foreground listener:', error);
  }
};
