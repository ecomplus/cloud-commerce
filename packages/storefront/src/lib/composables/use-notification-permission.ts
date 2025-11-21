import { ref, onMounted } from 'vue';

export type Props = {
  delayBeforePrompt?: number;
  daysBeforeReprompt?: number;
  onTokenReceived?: (token: string) => void | Promise<void>;
  registerFn?: () => Promise<string | null>;
  setupListenerFn?: (callback: (payload: any) => void) => Promise<void>;
}

const useNotificationPermission = (props: Props = {}) => {
  const {
    delayBeforePrompt = 3000,
    daysBeforeReprompt = 7,
    onTokenReceived,
    registerFn,
    setupListenerFn,
  } = props;
  const isVisible = ref(false);
  const isRequesting = ref(false);

  const checkPermission = () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return false;
    if (Notification.permission === 'denied') return false;
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const daysSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < daysBeforeReprompt) return false;
    }
    return true;
  };

  const requestPermission = async () => {
    if (!registerFn) {
      console.error('registerFn not provided');
      return;
    }
    isRequesting.value = true;
    try {
      const token = await registerFn();
      if (token) {
        if (onTokenReceived) {
          await onTokenReceived(token);
        }
        isVisible.value = false;
        localStorage.removeItem('notification-prompt-dismissed');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      isRequesting.value = false;
    }
  };

  const dismiss = () => {
    isVisible.value = false;
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
  };

  const setupForegroundListener = async () => {
    if (!setupListenerFn) return;
    await setupListenerFn((payload) => {
      console.log('Foreground notification:', payload);
      if (payload.notification) {
        const { title, body, icon } = payload.notification;
        // eslint-disable-next-line no-new
        new Notification(title || 'Nova notificação', {
          body,
          icon,
          data: payload.data,
        });
      }
    });
  };
  onMounted(() => {
    setTimeout(() => {
      isVisible.value = checkPermission();
    }, delayBeforePrompt);
    setupForegroundListener();
  });

  return {
    isVisible,
    isRequesting,
    requestPermission,
    dismiss,
  };
};

export default useNotificationPermission;

export {
  useNotificationPermission,
};
