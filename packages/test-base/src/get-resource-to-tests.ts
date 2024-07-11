import { logger } from 'firebase-functions/v1';
import api from '@cloudcommerce/api';

const getProductApi = async (productName?: string) => {
  const product = await api.get(`products?limit=1${productName ? `&name=${productName}` : ''}`).then(async ({ data }) => {
    if (data.result.length) {
      const projectId = data.result[0]._id;
      return api.get(`products/${projectId}`).then(({ data: productFound }) => productFound);
    }
    return null;
  }).catch((e) => {
    logger.error(e);
    throw e;
  });

  return product;
};

const getCustomerApi = async (email: string) => {
  const customer = await api.get(`customers?main_email=${email}`).then(async ({ data }) => {
    if (data.result.length) {
      const customerId = data.result[0]._id;
      return api.get(`customers/${customerId}`).then(({ data: customerFound }) => customerFound);
    }
    return null;
  }).catch((e) => {
    logger.error(e);
    throw e;
  });

  return customer;
};

export {
  getProductApi,
  getCustomerApi,
};
