import type { ApiError, Customers } from '@cloudcommerce/api/types';
import type { CheckoutCustomer } from '../../types/index';
import ecomUtils from '@ecomplus/utils';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';

type CustomerToSave = CheckoutCustomer & { addresses: Customers['addresses'] };
const readOrSaveCustomer = async (customer: CustomerToSave) => {
  const customerEndpoint = customer._id?.length === 24
    ? `customers/${customer._id}` as `customers/${Customers['_id']}`
    : `customers/main_email:${customer.main_email}` as `customers/${string}:${string}`;
  try {
    const { data: savedCustomer } = await api.get(customerEndpoint);
    const customerPatch: Partial<CustomerToSave> = {};
    Object.keys(customer).forEach((field) => {
      if (customer[field] && !savedCustomer[field]) {
        customerPatch[field] = customer[field];
      }
    });
    if (Object.keys(customerPatch).length) {
      api.patch(customerEndpoint, customerEndpoint).catch((_err) => {
        const err = _err as ApiError;
        logger.warn(`Failed updating customer ${customer.main_email} on checkout`, {
          customerPatch,
          statusCode: err.statusCode,
          response: err.response?.data,
        });
      });
    }
    return savedCustomer;
  } catch (_err: any) {
    const err = _err as ApiError;
    if (err.statusCode !== 404) {
      (err as any).checkoutCode = `cantReadCustomer,${customerEndpoint}`;
      logger.error(err);
    }
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
