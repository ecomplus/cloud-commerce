import type { ResourceId } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';

const updateOrderSubresource = (
  orderId: ResourceId,
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

const toCamelCase = (status: string) => {
  return status.replace(/^([A-Z])|[\s-_](\w)/g, (p1, p2) => {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
};

const getStore = () => {
  const { settingsContent } = config.get();
  return {
    lang: settingsContent.lang,
    domain: settingsContent.domain,
    name: settingsContent.name,
    corporate_name: settingsContent.corporate_name || settingsContent.name,
    contact_email: settingsContent.email,
    logo: {
      url: `https://${settingsContent.domain}${settingsContent.logo}`,
    },
    address: settingsContent.address,
  };
};

export {
  updateOrderSubresource,
  toCamelCase,
  getStore,
};
