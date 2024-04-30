import loadGtagSession from './load-gtag-session';

export type TrackingIds = {
  gclid?: string,
  g_client_id?: string,
  g_session_id?: string,
  fbc?: string,
  fbp?: string,
  ttclid?: string,
  client_id?: string,
  session_id?: string,
};

export const getTrackingIds = (trackingIds: TrackingIds, experimentId?: string) => {
  const {
    gtag,
    GTAG_TAG_ID,
    GA_TRACKING_ID,
    GIT_BRANCH,
  } = window as Window & { gtag?: Gtag.Gtag };
  const tagId = GTAG_TAG_ID || GA_TRACKING_ID;
  // https://developers.google.com/analytics/devguides/collection/ga4/integration
  const expVariantString: string | null = GIT_BRANCH && experimentId
    ? `${experimentId}-${GIT_BRANCH}`
    : (GIT_BRANCH?.startsWith('main-') && GIT_BRANCH) || null;
  if (typeof gtag === 'function') {
    if (tagId) {
      ['client_id', 'session_id', 'gclid'].forEach((key) => {
        gtag('get', tagId, key, (id) => {
          trackingIds[key === 'gclid' ? key : `g_${key}`] = id;
        });
      });
    }
    if (expVariantString) {
      gtag('event', 'experience_impression', {
        exp_variant_string: expVariantString,
      });
    }
  }
  const url = new URL(window.location.toString());
  (['gclid', 'fbclid', 'ttclid'] as const).forEach((key) => {
    const id = trackingIds[key] || url.searchParams.get(key);
    let value: string | undefined;
    if (id) {
      value = id;
      sessionStorage.setItem(`analytics_${key}`, id);
    } else {
      value = sessionStorage.getItem(`analytics_${key}`) || undefined;
    }
    if (!value) return;
    if (key === 'fbclid') {
      trackingIds.fbc = `fb.1.${Date.now()}.${value}`;
      return;
    }
    trackingIds[key] = value;
  });
  const cookieNames = ['_fbp'];
  if (!trackingIds.fbc) cookieNames.push('_fbc');
  if (!trackingIds.g_client_id) cookieNames.push('_ga');
  if (!trackingIds.g_session_id && tagId) cookieNames.push(`_ga_${tagId}`);
  cookieNames.forEach((cookieName) => {
    document.cookie.split(';').forEach((cookie) => {
      const [key, value] = cookie.split('=');
      if (key.trim() === cookieName && value) {
        switch (cookieName) {
          case '_fbp': trackingIds.fbp = value; return;
          case '_fbc': trackingIds.fbc = value; return;
          default:
        }
        const gVal = value.substring(6);
        if (cookieName === '_ga') {
          trackingIds.g_client_id = gVal;
          return;
        }
        trackingIds.g_session_id = gVal.split('.')[0];
      }
    });
  });
  if (
    GA_TRACKING_ID
    && typeof gtag !== 'function'
    && (!trackingIds.g_client_id || !trackingIds.g_session_id)
  ) {
    loadGtagSession(GA_TRACKING_ID, (key, id) => {
      trackingIds[key === 'gclid' ? key : `g_${key}`] = id;
    });
  }
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
  return {
    expVariantString,
  };
};

export default getTrackingIds;
