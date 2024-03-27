import type { CustomerCheckout } from '../../types/index';
import ecomUtils from '@ecomplus/utils';
import api from '@cloudcommerce/api';
import logger from 'firebase-functions/logger';

const findCustomerByEmail = async (email: string) => {
  try {
    const { data } = await api.get('customers', {
      params: { main_email: email },
      fields: ['_id'] as const,
    });
    if (data.result.length) {
      return data.result[0]._id;
    }
    return null;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

export default async (customer: CustomerCheckout) => {
  if (customer._id && customer._id.length === 24) {
    return customer._id as string & { length: 24; };
  }
  if (customer.main_email) {
    const customerId = await findCustomerByEmail(customer.main_email);
    if (customerId) {
      return customerId;
    }
  }
  try {
    const { data: { _id: newCustomerId } } = await api.post('customers', {
      display_name: customer.name.given_name || 'visitor',
      ...customer,
    });
    return newCustomerId;
  } catch (err) {
    logger.error(err);
    return ecomUtils.randomObjectId() as string & { length: 24; };
  }
};
