import { useDebounceFn } from '@vueuse/core';
import { customer } from '@@sf/state/customer-session';
import utm from '@@sf/scripts/session-utm';
import afetch from '../../helpers/afetch';

export const sessionIds: {
  gclid?: string,
  g_client_id?: string,
  g_session_id?: string,
  fbclid?: string,
  fbp?: string,
  client_id?: string,
  session_id?: string,
} = {};

if (!import.meta.env.SSR) {
  const { gtag, GTAG_TAG_ID } = window as any;
  if (GTAG_TAG_ID && typeof gtag === 'function') {
    ['client_id', 'session_id', 'gclid'].forEach((key) => {
      gtag('get', GTAG_TAG_ID, key, (id) => {
        sessionIds[key === 'gclid' ? key : `g_${key}`] = id;
      });
    });
  }
  const url = new URL(window.location.toString());
  ['gclid', 'fbclid'].forEach((key) => {
    const id = sessionIds[key] || url.searchParams.get(key);
    if (id) {
      sessionIds[key] = id;
      sessionStorage.setItem(`analytics_${key}`, id);
    } else {
      sessionIds[key] = sessionStorage.getItem(`analytics_${key}`) || undefined;
    }
  });
  const cookieNames = ['_fbp'];
  if (!sessionIds.fbclid) cookieNames.push('_fbc');
  if (!sessionIds.g_client_id) cookieNames.push('_ga');
  cookieNames.forEach((cookieName) => {
    document.cookie.split(';').forEach((cookie) => {
      const [key, value] = cookie.split('=');
      if (key.trim() === cookieName && value) {
        switch (cookieName) {
          case '_fbp': sessionIds.fbp = value; break;
          case '_fbc': sessionIds.fbclid = value; break;
          case '_ga': sessionIds.g_client_id = value.substring(6); break;
          default:
        }
      }
    });
  });
  ['client_id', 'session_id'].forEach((key) => {
    const storage = key === 'client_id' ? localStorage : sessionStorage;
    const storedValue = storage.getItem(`analytics_${key}`);
    if (storedValue) {
      sessionIds[key] = storedValue;
    } else {
      sessionIds[key] = sessionIds[`g_${key}`]
        || `${Math.ceil(Math.random() * 1000000)}.${Math.ceil(Math.random() * 1000000)}`;
    }
    storage.setItem(`analytics_${key}`, sessionIds[key]);
  });
}

let eventsToSend: Array<Record<string, any>> = [];
const _sendServerEvents = useDebounceFn(() => {
  afetch(`/_analytics`, {
    method: 'post',
    body: {
      ...sessionIds,
      user_id: customer.value._id,
      utm,
      events: eventsToSend,
    },
  });
  eventsToSend = [];
}, 200);
const sendServerEvent = (event: Record<string, any>) => {
  eventsToSend.push(event);
  _sendServerEvents();
};

export const GTAG_EVENT_TYPE = 'GtagEvent';

type EventMessage = typeof sessionIds &
  { utm: typeof utm } &
  {
    type: string,
    user_id?: string & { length: 24 },
    event: {
      name: string,
      params: Record<string, any>,
    },
  };

export const sendGtagEvent = (name: string, params: Record<string, any> = {}) => {
  try {
    const data: EventMessage = {
      type: GTAG_EVENT_TYPE,
      ...sessionIds,
      user_id: customer.value._id,
      utm,
      event: { name, params },
    };
    sendServerEvent(data.event);
    window.postMessage(data, window.origin);
  } catch (e) {
    console.error(e);
  }
};

export const watchGtagEvents = (cb: (payload: EventMessage) => any) => {
  window.addEventListener('message', ({ data }: { data: EventMessage }) => {
    if (data.type === GTAG_EVENT_TYPE) {
      cb(data);
    }
  });
};
