import type { Customers } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import { logger } from 'firebase-functions';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
import { generateAccessToken, findCustomerByEmail } from '@cloudcommerce/passport';

type CustomerCheckout = {
  _id?: string,
  main_email: string
}

const firestore = getFirestore();

const findCustomerById = async (id: string | undefined) => {
  if (id) {
    try {
      const customer = (await api.get(`customers/${id}`)).data;
      if (customer) {
        return customer as Customers;
      }
      return null;
    } catch (e) {
      logger.error(e);
      return null;
    }
  }
  return null;
};

export default async (customer: CustomerCheckout) => {
  const returnCustomerAndAcessToken = async (custumer: Customers | null) => {
    if (custumer) {
      const authCustomer = await generateAccessToken(firestore, custumer._id);
      return {
        _id: custumer._id,
        access_token: authCustomer.access_token,
      };
    }
    return null;
  };

  if (!customer._id) {
    // try to find customer by e-mail
    // GET customer object
    const customerFound = await findCustomerByEmail(customer.main_email);
    // use first resulted customer ID
    return returnCustomerAndAcessToken(customerFound);
  }
  // customer ID already defined
  const customerFound = await findCustomerById(customer._id);
  return returnCustomerAndAcessToken(customerFound);
};
