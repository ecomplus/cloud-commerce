import { customer } from '@@sf/state/customer-session';
import utm from '@@sf/scripts/session-utm';

export const trackingIds: {
  gclid?: string,
  g_client_id?: string,
  g_session_id?: string,
  fbclid?: string,
  fbp?: string,
  client_id?: string,
  session_id?: string,
} = {};

if (!import.meta.env.SSR) {
  const {
    gtag,
    GTAG_TAG_ID,
    GA_TRACKING_ID,
  } = window as { [k:string]: any, gtag?: Gtag.Gtag };
  const tagId = GTAG_TAG_ID || GA_TRACKING_ID;
  if (tagId && typeof gtag === 'function') {
    ['client_id', 'session_id', 'gclid'].forEach((key) => {
      gtag('get', tagId, key, (id) => {
        trackingIds[key === 'gclid' ? key : `g_${key}`] = id;
      });
    });
  }
  const url = new URL(window.location.toString());
  ['gclid', 'fbclid'].forEach((key) => {
    const id = trackingIds[key] || url.searchParams.get(key);
    if (id) {
      trackingIds[key] = id;
      sessionStorage.setItem(`analytics_${key}`, id);
    } else {
      trackingIds[key] = sessionStorage.getItem(`analytics_${key}`) || undefined;
    }
  });
  const cookieNames = ['_fbp'];
  if (!trackingIds.fbclid) cookieNames.push('_fbc');
  if (!trackingIds.g_client_id) cookieNames.push('_ga');
  cookieNames.forEach((cookieName) => {
    document.cookie.split(';').forEach((cookie) => {
      const [key, value] = cookie.split('=');
      if (key.trim() === cookieName && value) {
        switch (cookieName) {
          case '_fbp': trackingIds.fbp = value; break;
          case '_fbc': trackingIds.fbclid = value; break;
          case '_ga': trackingIds.g_client_id = value.substring(6); break;
          default:
        }
      }
    });
  });
  ['client_id', 'session_id'].forEach((key) => {
    const storage = key === 'client_id' ? localStorage : sessionStorage;
    const storedValue = storage.getItem(`analytics_${key}`);
    if (storedValue) {
      trackingIds[key] = storedValue;
    } else {
      trackingIds[key] = trackingIds[`g_${key}`]
        || `${Math.ceil(Math.random() * 1000000)}.${Math.ceil(Math.random() * 1000000)}`;
    }
    storage.setItem(`analytics_${key}`, trackingIds[key]);
  });
}

export const GTAG_EVENT_TYPE = 'GtagEvent';

// `page_view` params not typed
// https://developers.google.com/tag-platform/gtagjs/reference/events#page_view
type PageViewParams = {
  page_location?: string,
  client_id?: string,
  language?: string,
  page_encoding?: string,
  page_title?: string,
  user_agent?: string,
};
type EventMessage = typeof trackingIds &
  { utm: typeof utm } &
  {
    type: string,
    user_id?: string & { length: 24 },
    event: {
      name: 'page_view',
      params: PageViewParams,
    } | {
      name: Exclude<Gtag.EventNames, 'page_view'>,
      params: Gtag.EventParams,
    },
  };

export const getAnalyticsContext = () => {
  return {
    ...trackingIds,
    user_id: customer.value._id,
    utm,
  };
};

export const emitGtagEvent = <N extends Gtag.EventNames = 'view_item'>
  (name: N, params: N extends 'page_view' ? PageViewParams : Gtag.EventParams = {}) => {
  try {
    const data: EventMessage = {
      type: GTAG_EVENT_TYPE,
      ...getAnalyticsContext(),
      event: {
        name: name as 'view_item',
        params: params as Gtag.EventParams,
      },
    };
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
