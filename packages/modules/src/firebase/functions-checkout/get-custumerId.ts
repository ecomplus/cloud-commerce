import api from '@cloudcommerce/api';
import { logger } from 'firebase-functions';
// eslint-disable-next-line import/no-unresolved

type CustomerCheckout = {
  _id?: string,
  main_email: string
}

const findCustomerByEmail = async (email: string | undefined) => {
  try {
    const { data } = await api.get(`customers?main_email=${email}`);
    if (data.result.length) {
      return data.result[0]._id;
    }
    return null;
  } catch (e) {
    logger.error(e);
    return null;
  }
};

export default (customer: CustomerCheckout) => {
  if (!customer._id) {
    // try to find customer by e-mail
    // GET customer object
    return findCustomerByEmail(customer.main_email);
    // use first resulted customer ID
  }
  // customer ID already defined
  return customer._id;
};
