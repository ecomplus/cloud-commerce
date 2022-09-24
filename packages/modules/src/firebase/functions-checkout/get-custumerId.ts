import type { CustomerCheckout } from '../../types/index';
import api from '@cloudcommerce/api';
import { logger } from 'firebase-functions';

const findCustomerByEmail = async (email: string, accessToken: string) => {
  try {
    const { data } = await api.get(`customers?main_email=${email}`, {
      accessToken,
    });
    if (data.result.length) {
      return data.result[0]._id;
    }
    return null;
  } catch (e) {
    logger.error(e);
    return null;
  }
};

export default (accessToken: string, customer?: CustomerCheckout) => {
  if (customer) {
    if (!customer._id) {
    // try to find customer by e-mail
    // GET customer object
      return customer.main_email ? findCustomerByEmail(customer.main_email, accessToken) : null;
    // use first resulted customer ID
    } if (customer._id && (typeof customer._id === 'string') && customer._id.length === 24) {
      // customer ID already defined
      return customer._id as string & { length: 24; };
    }
  }
  return null;
};
