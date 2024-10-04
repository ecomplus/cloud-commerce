/* eslint-disable import/no-mutable-exports */
let utm: {
  source?: string,
  medium?: string,
  campaign?: string,
  term?: string,
  content?: string,
} = {};
let sessionReferral: string | null = null;
let sessionCoupon: string | null = null;

if (!import.meta.env.SSR) {
  const storageKey = 'ecomUtm';
  const storedValue = localStorage.getItem(storageKey);
  const at = Date.now();
  try {
    const data = (storedValue && JSON.parse(storedValue)) || {};
    if (new Date(data.at + 1000 * 60 * 60 * 24 * 7).getTime() >= at) {
      utm = data.utm || {};
    }
  } catch {
    utm = {};
  }
  let isCurrentUrl = false;
  const urlParams = new URLSearchParams(window.location.search);
  ['source', 'medium', 'campaign', 'term', 'content'].forEach((utmParam) => {
    const value = urlParams.get(`utm_${utmParam}`);
    if (value) {
      utm[utmParam] = value;
      isCurrentUrl = true;
    }
  });
  if (isCurrentUrl) {
    localStorage.setItem(storageKey, JSON.stringify({ at, utm }));
  }
  sessionReferral = urlParams.get('referral')
    || sessionStorage.getItem('ecomReferral');
  if (sessionReferral && !sessionStorage.getItem('ecomReferral')) {
    sessionStorage.setItem('ecomReferral', sessionReferral);
  }
  sessionCoupon = urlParams.get('coupon')
    || sessionStorage.getItem('st_discount_coupon');
  if (sessionCoupon && !sessionStorage.getItem('st_discount_coupon')) {
    sessionStorage.setItem('st_discount_coupon', sessionCoupon);
  }
}

export default utm;

export { utm, sessionReferral, sessionCoupon };
