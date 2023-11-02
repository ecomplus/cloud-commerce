/* eslint-disable import/prefer-default-export */
import type { Carts, Customers, Orders } from '@cloudcommerce/types';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import logger from 'firebase-functions/logger';
import {
  Content,
  EventRequest,
  FacebookAdsApi,
  UserData,
} from 'facebook-nodejs-business-sdk';
import api from '@cloudcommerce/api';
import {
  createContent,
  createCustonData,
  createServeEvent,
  createUserData,
} from './functions-lib/create-fb-objects';

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const resourceId = apiEvent.resource_id;
  logger.info('>> ', resourceId, ' - Action: ', apiEvent.action);
  const key = `${evName}_${resourceId}`;
  const appData = { ...app.data, ...app.hidden_data };
  if (
    Array.isArray(appData.ignore_events)
    && appData.ignore_events.includes(evName)
  ) {
    logger.info('>> ', key, ' - Ignored event');
    return null;
  }
  logger.info(`> Webhook ${resourceId} [${evName}]`);

  if (!process.env.FB_GRAPH_TOKEN) {
    const fbGraphToken = appData.fb_graph_token;
    if (typeof fbGraphToken === 'string' && fbGraphToken) {
      process.env.FB_GRAPH_TOKEN = fbGraphToken;
    } else {
      logger.warn('Missing Facebook Graph token');
    }
  }

  if (!process.env.FB_PIXEL_ID) {
    const fbPixelId = appData.fb_pixel_id;
    if (typeof fbPixelId === 'string' && fbPixelId) {
      process.env.FB_PIXEL_ID = fbPixelId;
    } else {
      logger.warn('Missing Facebook pixel ID');
    }
  }

  if (process.env.FB_PIXEL_ID && process.env.FB_GRAPH_TOKEN) {
    FacebookAdsApi.init(process.env.FB_GRAPH_TOKEN);

    if (evName === 'orders-new') {
      const order = apiDoc as Orders;
      if (order.status === 'cancelled') {
        return null;
      }
      const orderId = order._id;

      let eventID: undefined | string;
      let clientUserAgent: undefined | string;
      if (order.metafields) {
        const metafield = order.metafields.find(({ namespace, field }) => {
          return namespace === 'fb' && field === 'pixel';
        });
        if (metafield) {
          const { value } = metafield;
          eventID = value.eventID as string;
          clientUserAgent = value.userAgent as string;
        }
      }
      if (!clientUserAgent) {
        clientUserAgent = order.client_user_agent;
      }

      try {
        const buyer = order.buyers && order.buyers[0];
        const clientIp = order.client_ip;
        if (orderId && buyer && clientIp) {
          // https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api#send

          const userData = createUserData(buyer, clientIp);

          const shippingLine = order.shipping_lines && order.shipping_lines[0];
          if (shippingLine && shippingLine.to.zip) {
            userData.setZip(shippingLine.to.zip.replace(/\D/g, ''));
            if (shippingLine.to.province_code) {
              userData.setState(shippingLine.to.province_code.toLowerCase());
              userData.setCountry((shippingLine.to.country_code || 'BR').toLowerCase());
            }
          }

          const contents: Content[] = [];
          const { items } = order;
          if (items && items.length) {
            items.forEach((item) => {
              if (item.quantity > 0) {
                const content = createContent(item);
                contents.push(content);
              }
            });
          }
          const customData = createCustonData(contents, order.amount.total, order.currency_id);

          const eventMs = Math.min(
            new Date(order.created_at || apiEvent.timestamp).getTime(),
            Date.now() - 3000,
          );
          logger.log(`>> #${orderId} (${eventID}) at ${eventMs}ms`);

          let eventSourceUrl: string | undefined;
          if (order.checkout_link) {
            eventSourceUrl = order.checkout_link;
          } else if (order.domain) {
            eventSourceUrl = `https://${order.domain}`;
          }

          const serverEvent = createServeEvent(
            'Purchase',
            eventMs,
            userData,
            customData,
            eventID || orderId,
            eventSourceUrl,
          );

          const eventsData = [serverEvent];
          const eventRequest = new EventRequest(
            process.env.FB_GRAPH_TOKEN,
            process.env.FB_PIXEL_ID,
          ).setEvents(eventsData);

          try {
            const response = await eventRequest.execute();
            logger.info('>>Event sent: ', response);
            return null;
          } catch (err: any) {
            logger.error(`Event request error: ${err.message} =>`, err);
            return null;
          }
        }
        logger.warn('>> OrderId , buyer or clientIp not found');
        return null;
      } catch (err: any) {
        logger.error(`>>Error ${err.message} =>`, err);
        throw err;
      }
    } else {
      const cart = apiDoc as Carts;

      if (cart.completed) {
        return null;
      }

      const eventMs = Math.min(
        new Date(cart.created_at || apiEvent.timestamp).getTime(),
        Date.now() - 3000,
      );
      logger.log(`#${cart._id} at ${eventMs}ms`);
      let customer: Customers | undefined;
      if (cart.customers && cart.customers.length > 0) {
        try {
          customer = (await api.get(`customers/${cart.customers[0]}`)).data;
        } catch (err) {
          logger.error('>> Error getting customer => ', err);
        }
      }

      let userData: UserData | undefined;
      let address: Exclude<Customers['addresses'], undefined>[number] | undefined;
      if (customer) {
        userData = createUserData(customer);
        if (customer.addresses && customer.addresses.length > 0) {
          [address] = customer.addresses;
        }
      }

      if (address && address.zip && userData) {
        userData.setZip(address.zip.replace(/\D/g, ''));
        if (address.province_code) {
          userData.setState(address.province_code.toLowerCase());
          userData.setCountry((address.country_code || 'BR').toLowerCase());
        }
      }

      const contents: Content[] = [];
      const { items } = cart;
      if (items && items.length) {
        items.forEach((item) => {
          if (item.quantity > 0) {
            const content = createContent(item);
            contents.push(content);
          }
        });
      }
      const customData = createCustonData(contents, cart.subtotal || 0);

      let eventSourceUrl: string | undefined;
      if (cart.permalink) {
        eventSourceUrl = cart.permalink;
      }
      const serverEvent = createServeEvent(
        'InitiateCheckout',
        eventMs,
        userData,
        customData,
        cart._id,
        eventSourceUrl,
      );

      const eventsData = [serverEvent];
      const eventRequest = (new EventRequest(process.env.FB_GRAPH_TOKEN, process.env.FB_PIXEL_ID))
        .setEvents(eventsData);

      try {
        const response = await eventRequest.execute();
        logger.info('>> Event sent: ', response);
        return null;
      } catch (err: any) {
        logger.error(`Event request error: ${err.message} =>`, err);
        return null;
      }
    }
  }
  logger.warn('>> PixelId or fbToken not found');
  return null;
};

export const fbconversions = {
  onStoreEvent: createAppEventsFunction(
    'fbConversions',
    handleApiEvent,
  ) as any,
};
