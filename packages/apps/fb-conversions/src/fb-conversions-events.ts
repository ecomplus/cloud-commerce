/* eslint-disable import/prefer-default-export */
import type { Orders } from '@cloudcommerce/types';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import logger from 'firebase-functions/logger';
import {
  Content,
  CustomData,
  DeliveryCategory,
  EventRequest,
  UserData,
  ServerEvent,
  FacebookAdsApi,
} from 'facebook-nodejs-business-sdk';

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
      const fbPixelId = appData.fb_pixel_id;
      const fbGraphToken = appData.fb_graph_token;

      if (fbPixelId && fbGraphToken) {
        FacebookAdsApi.init(fbGraphToken);

        const userData = new UserData();
        userData.setExternalId(buyer._id);
        const emails: string[] = [];
        buyer.emails?.forEach((email) => {
          emails.push(email.address);
        });

        if (buyer.main_email) {
          emails.push(buyer.main_email);
        }
        if (emails.length) {
          userData.setEmails(emails);
        }
        if (buyer.phones && buyer.phones.length) {
          userData.setPhones(buyer.phones.map(({ number }) => String(number)));
        }
        if (buyer.name && buyer.name.given_name) {
          userData.setFirstName(buyer.name.given_name);
          if (buyer.name.family_name) {
            userData.setLastName(buyer.name.family_name);
          }
        }
        if (buyer.pronoun === 'she' || buyer.pronoun === 'he') {
          userData.setGender(buyer.pronoun === 'she' ? 'f' : 'm');
        }
        userData.setClientIpAddress(clientIp);
        if (clientUserAgent) {
          userData.setClientUserAgent(clientUserAgent);
        }
        const shippingLine = order.shipping_lines && order.shipping_lines[0];
        if (shippingLine && shippingLine.to.zip) {
          userData.setZip(shippingLine.to.zip.replace(/\D/g, ''));
          if (shippingLine.to.province_code) {
            userData.setState(shippingLine.to.province_code.toLowerCase());
            userData.setCountry((shippingLine.to.country_code || 'BR').toLowerCase());
          }
        }

        const contents: any[] = [];
        const { items } = order;
        if (items && items.length) {
          items.forEach((item) => {
            if (item.quantity > 0) {
              const content = (new Content())
                .setId(item.sku || item.product_id)
                .setQuantity(item.quantity)
                .setDeliveryCategory(DeliveryCategory.HOME_DELIVERY);
              if (item.name) {
                content.setTitle(item.name);
              }
              contents.push(content);
            }
          });
        }
        const customData = (new CustomData())
          .setContents(contents)
          .setCurrency((order.currency_id && order.currency_id.toLowerCase()) || 'brl')
          .setValue(Math.round(order.amount.total * 100) / 100);

        const eventMs = Math.min(
          new Date(order.created_at || apiEvent.timestamp).getTime(),
          Date.now() - 3000,
        );
        logger.log(`>> (App fb-conversions): #${orderId} (${eventID}) at ${eventMs}ms`);

        const serverEvent = (new ServerEvent())
          .setEventName('Purchase')
          .setEventTime(Math.round(eventMs / 1000))
          .setUserData(userData)
          .setCustomData(customData)
          .setActionSource('website');

        if (order.checkout_link) {
          serverEvent.setEventSourceUrl(order.checkout_link);
        } else if (order.domain) {
          serverEvent.setEventSourceUrl(`https://${order.domain}`);
        }
        serverEvent.setEventId(eventID || orderId);

        const eventsData = [serverEvent];
        const eventRequest = (new EventRequest(fbGraphToken, fbPixelId))
          .setEvents(eventsData);

        try {
          const response = await eventRequest.execute();
          logger.info('>> (App fb-conversions): ', response);
          return null;
        } catch (err: any) {
          logger.error(`(App fb-conversions): event request error: ${err.message} =>`, err);
          return null;
        }
      }
      logger.warn('>> (App fb-conversions): PixelId or fbToken not found');
      return null;
    }
    logger.warn('>> (App fb-conversions): orderId , buyer or clientIp not found');
    return null;
  } catch (err: any) {
    logger.error(`>> (App fb-conversions) Error ${err.message} =>`, err);
    throw err;
  }
};

export const fbconversions = {
  onStoreEvent: createAppEventsFunction(
    'fbConversions',
    handleApiEvent,
  ) as any,
};
