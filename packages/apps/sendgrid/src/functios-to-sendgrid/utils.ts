import logger from 'firebase-functions/lib/logger';
import axios from 'axios';
import api from '@cloudcommerce/api';

const sgAxios = axios.create({
  baseURL: 'https://api.sendgrid.com/v3/mail',
  headers: {
    'Content-Type': 'application/json',
  },
});

const sgSendMail = (
  bodyMail: {[key:string]: any},
  apiKey: string,
) => {
  return sgAxios.post('/send', bodyMail, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
};

const updateOrderSubresource = (
  orderId: string,
  subresource: string,
  lastValidRecord: {[key:string]: any},
  insertedId: string,
) => {
  const statusRecordId: string = lastValidRecord ? lastValidRecord._id : insertedId;

  const body = {
    customer_notified: true,
  };
  // console.log(`>> Email Send: #${storeId} ${statusRecordId}`)
  return api.patch(`orders/${orderId}/${subresource}/${statusRecordId}`, body);
};

const handleErr = (err: any) => {
  logger.error(err);
  // request to Store API with error response
  // return error status code
  if (axios.isAxiosError(err)) {
    let message = 'Axios error ';
    if (err.message || err.code) {
      message += ` ${err.code}: ${err.message}`;
      if (err.response?.data) {
        message += `\n\n${JSON.stringify(err.response.data)}`;
      }
    }
    return {
      status: err.response.status || 500,
      error: 'STORE_API_ERR',
      message,
    };
  }
  const { message } = err;
  return {
    status: 500,
    error: 'STORE_API_ERR',
    message,
  };
};

export {
  updateOrderSubresource,
  sgSendMail,
  handleErr,
};
