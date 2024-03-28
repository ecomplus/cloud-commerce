import type { Customers } from '@cloudcommerce/types';
import type { CheckoutCustomer } from '../../types/index';
import ecomUtils from '@ecomplus/utils';
import api from '@cloudcommerce/api';
import logger from 'firebase-functions/logger';

const readOrSaveCustomer = async (customer: CheckoutCustomer) => {
  const customerEndpoint = customer._id?.length === 24
    ? `customers/${customer._id}` as `customers/${Customers['_id']}`
    : `customers/main_email:${customer.main_email}` as `customers/${string}:${string}`;
  try {
    const { data: savedCustomer } = await api.get(customerEndpoint);
    return savedCustomer;
  } catch (err: any) {
    err.checkoutCode = `cantReadCustomer,${customerEndpoint}`;
    logger.error(err);
  }
  const newCustomer = {
    display_name: customer.name.given_name || 'visitor',
    ...customer,
  };
  try {
    const { data: { _id: newCustomerId } } = await api.post('customers', newCustomer);
    newCustomer._id = newCustomerId;
    return newCustomer as Customers;
  } catch (err: any) {
    err.checkoutCode = 'cantSaveNewCustomer';
    logger.error(err);
    if (!newCustomer._id) {
      newCustomer._id = ecomUtils.randomObjectId();
    }
    return newCustomer as Customers;
  }
};

export default readOrSaveCustomer;
