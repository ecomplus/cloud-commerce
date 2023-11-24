import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import type {
  ResourceId,
  Customers,
  Orders,
  ResourceAndId,
} from '@cloudcommerce/api/types';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';
import api from '@cloudcommerce/api';

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const appData = { ...app.data, ...app.hidden_data };
  const resourceId = apiEvent.resource_id;
  const key = `${evName}_${resourceId}`;

  const isOrder = evName.startsWith('orders-');
  const isCustomer = evName.startsWith('customers-');

  const firestoreColl = getFirestore().collection('affilateProgramOrders');

  if (
    (Array.isArray(appData.ignore_events)
      && appData.ignore_events.includes(evName))
    || (!isCustomer && !isOrder)
  ) {
    logger.info('>> ', key, ' - Ignored event');
    return null;
  }

  let newCustomerId: ResourceId | undefined;
  let newCustomerEmail: Customers['main_email'] | undefined;
  let referralId: ResourceId | undefined;
  if (isCustomer) {
    const customer = apiDoc as Customers;
    newCustomerId = customer._id;
    referralId = customer.affiliate_code as ResourceId;
    newCustomerEmail = customer.main_email;
    if (!newCustomerId || !newCustomerEmail || !referralId) {
      return null;
    }
    if (!/^[a-f0-9]{24}$/.test(referralId)) {
      return null;
    }
  }

  let orderId: Orders['_id'] | undefined;
  let buyerId: ResourceId | undefined;
  let orderSubtotal: number = 0;
  let isPaid: boolean = false;
  let isCancelled: boolean = false;

  if (isOrder) {
    const order = apiDoc as Orders;
    orderId = order._id;
    orderSubtotal = order.amount?.subtotal || 0;
    const orderStatus = order.financial_status?.current;
    buyerId = order.buyers?.[0]?._id;
    if (!orderId || !orderSubtotal || !orderStatus || !buyerId) {
      return null;
    }

    switch (orderStatus) {
      case 'paid':
        isPaid = true;
        break;
      case 'unauthorized':
      case 'partially_refunded':
      case 'refunded':
      case 'voided':
        isCancelled = true;
        break;
      default:
        break;
    }
    if (!isPaid && !isCancelled) {
      return null;
    }
  }

  logger.info(`${isOrder ? 'Orders' : 'Customers'}`);
  try {
    if (isCustomer && appData.points_on_signup) {
      const referralCustomer = (await api.get(`customers/${referralId as ResourceId}`)).data;
      if (!referralCustomer?.enabled) {
        logger.warn('Inactive customer');
        return null;
      }
      if (referralCustomer.main_email === newCustomerEmail) {
        logger.warn('new customer is the affiliate, same email');
        return null;
      }
      // save new customer points
      // TODO: set type for partial body in post method
      const pointsEndpoint = `customers/${newCustomerId}/loyalty_points_entries` as `${ResourceAndId}/string`;
      const d = new Date();
      d.setDate(d.getDate() + 120);
      const validThru = d.toISOString();
      await api.post(
        pointsEndpoint,
        {
          name: 'Convite',
          program_id: 'referreds0',
          earned_points: appData.points_on_signup,
          active_points: appData.points_on_signup,
          ratio: 1,
          valid_thru: validThru,
        },
      );
    }

    if (isOrder && isPaid && appData.points_on_referral && orderId) {
      if (appData.min_subtotal_to_earn > orderSubtotal) {
        return null;
      }
      const buyerCustomer = (await api.get(`customers/${buyerId as ResourceId}`)).data;

      if (!buyerCustomer?.enabled) {
        logger.warn('Inactive customer');
        return null;
      }

      const affiliateCode = buyerCustomer.affiliate_code as ResourceId | undefined;
      if (!affiliateCode) return null;
      const referralCustomer = (await api.get(`customers/${affiliateCode}`)).data;
      if (referralCustomer?.doc_number === buyerCustomer.doc_number) {
        logger.warn('Order placed by affiliate');
        return null;
      }
      logger.info(`Order ${orderId} paid by ${buyerId} validated`);

      const docRef = firestoreColl.doc(`${orderId}`);
      if (!appData.on_all_orders) {
        // check if points not already paid for this order
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
          return null;
        }
      }
      let earnedPoints: number;
      if (typeof appData.points_on_referral === 'number') {
        earnedPoints = appData.points_on_referral;
      } else if (appData.points_on_referral.type === 'percentage') {
        earnedPoints = (orderSubtotal * appData.points_on_referral.value) / 100;
      } else {
        earnedPoints = appData.points_on_referral.value;
      }
      if (!(earnedPoints > 0)) {
        return null;
      }
      // TODO: set type for partial body in post method
      const pointsEndpoint = `/customers/${buyerCustomer.affiliate_code}/loyalty_points_entries` as `${ResourceAndId}/string`;
      await api.post(
        pointsEndpoint,
        {
          name: 'Afiliado',
          program_id: 'affiliates0',
          earned_points: earnedPoints,
          active_points: earnedPoints,
          ratio: 1,
        },
      );
      await docRef.set({
        buyerId,
        referralId: buyerCustomer.affiliate_code,
        earnedPoints,
        t: Timestamp.fromDate(new Date()),
      });
    }

    return null;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

export default handleApiEvent;
