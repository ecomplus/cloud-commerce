const { sessionStorage } = window;
const storageKey = 'ecomUtm';
const utm: { [k: string]: string } = JSON.parse(sessionStorage.getItem(storageKey)) || {};

let isCurrentUtm;
const urlParams = new URLSearchParams(window.location.search);
['source', 'medium', 'campaign', 'term', 'content'].forEach((utmParam) => {
  const value = urlParams.get(`utm_${utmParam}`);
  if (typeof value === 'string') {
    utm[utmParam] = value;
    isCurrentUtm = true;
  }
});
if (isCurrentUtm) {
  sessionStorage.setItem(storageKey, JSON.stringify(utm));
}

export default utm;
