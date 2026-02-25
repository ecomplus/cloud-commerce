export type TrackingIds = {
  gclid?: string,
  g_client_id?: string,
  g_session_id?: string,
  fbc?: string,
  fbp?: string,
  ttclid?: string,
  awc?: string,
  awin_channel?: string,
  client_id?: string,
  session_id?: string,
  ip6?: string,
};

export const getTrackingIds = (
  trackingIds: TrackingIds,
  experimentId?: string | null,
) => {
  const {
    gtag,
    GTAG_TAG_ID,
    GA_TRACKING_ID,
    GIT_BRANCH,
  } = window as Window & { gtag?: Gtag.Gtag };
  const tagId = GTAG_TAG_ID || GA_TRACKING_ID;
  // https://developers.google.com/analytics/devguides/collection/ga4/integration
  const expVariantString: string | null = experimentId
    ? (GIT_BRANCH && `${experimentId}-${GIT_BRANCH}`) || experimentId
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
  (['gclid', 'fbclid', 'ttclid', 'awc'] as const).forEach((key) => {
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
  const cookieNames = ['_fbp', 'AwinChannelCookie'];
  if (!trackingIds.fbc) cookieNames.push('_fbc');
  if (!trackingIds.g_client_id) cookieNames.push('_ga');
  if (!trackingIds.g_session_id && tagId) cookieNames.push(`_ga_${tagId}`);
  if (!trackingIds.awc) cookieNames.push('awc');
  cookieNames.forEach((cookieName) => {
    document.cookie.split(';').forEach((cookie) => {
      const [key, value] = cookie.split('=');
      if (key.trim() === cookieName && value) {
        switch (cookieName) {
          case '_fbp': trackingIds.fbp = value; return;
          case '_fbc': trackingIds.fbc = value; return;
          case 'AwinChannelCookie': trackingIds.awin_channel = value; return;
          default:
        }
        if (cookieName.startsWith('_ga')) {
          const gVal = value.substring(6);
          if (cookieName === '_ga') {
            trackingIds.g_client_id = gVal;
            return;
          }
          trackingIds.g_session_id = gVal.split('.')[0];
          return;
        }
        trackingIds[cookieName as 'awc'] = value;
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
  window.$interactionOrAwaken?.then(async () => {
    try {
      const response = await fetch('https://api64.ipify.org/');
      if (response.ok) {
        const ip64 = await response.text();
        if (
          typeof ip64 === 'string'
          && /([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/.test(ip64)
        ) {
          trackingIds.ip6 = ip64;
        }
      }
    } catch {
      //
    }
  });
  return {
    expVariantString,
  };
};

export default getTrackingIds;
