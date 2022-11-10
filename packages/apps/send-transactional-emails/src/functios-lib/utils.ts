import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';

const updateOrderSubresource = (
  orderId: string,
  subresource: string,
  lastValidRecord: { [key: string]: any },
  insertedId: string,
) => {
  const statusRecordId: string = lastValidRecord ? lastValidRecord._id : insertedId;

  const body = {
    customer_notified: true,
  };
  return api.patch(`orders/${orderId}/${subresource}/${statusRecordId}`, body);
};

const handleErr = (err: any) => {
  logger.error(err);
  // request to Store API with error response
  const { message } = err;
  return {
    status: 500,
    error: 'APP_ERR',
    message: message || 'Unexpected error',
  };
};
const toCamelCase = (status: string) => {
  return status.replace(/^([A-Z])|[\s-_](\w)/g, (p1, p2) => {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
};

export {
  updateOrderSubresource,
  handleErr,
  toCamelCase,
};
