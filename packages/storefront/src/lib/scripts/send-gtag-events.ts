import { useDebounceFn } from '@vueuse/core';
import { customer } from '@@sf/state/customer-session';
import utm from '@@sf/scripts/session-utm';
import afetch from '../../helpers/afetch';

let eventsToSend: Array<Record<string, any>> = [];
const _sendServerEvents = useDebounceFn(() => {
  afetch(`/_analytics`, {
    method: 'post',
    body: { events: eventsToSend },
  });
  eventsToSend = [];
}, 200);
const sendServerEvent = (data: Record<string, any>) => {
  eventsToSend.push(data);
  _sendServerEvents();
};

export const GTAG_EVENT_TYPE = 'GtagEvent';

export const sendGtagEvent = (name: string, params: Record<string, any>) => {
  try {
    const data = {
      type: GTAG_EVENT_TYPE,
      name,
      params,
    };
    sendServerEvent(data);
    window.postMessage(data, window.origin);
  } catch (e) {
    console.error(e);
  }
};

if (!import.meta.env.SSR) {
  const { $storefront: { settings } } = globalThis;
  const url = new URL(window.location.toString());
  Object.keys(utm).forEach((utmParam) => {
    if (utm[utmParam] && !url.searchParams.get(`utm_${utmParam}`)) {
      url.searchParams.set(`utm_${utmParam}`, utm[utmParam]);
    }
  });
  sendGtagEvent('page_view', {
    page_location: url.toString(),
    client_id: customer.value._id,
    language: settings.lang,
    page_title: document.title,
    user_agent: navigator.userAgent,
  });
}
