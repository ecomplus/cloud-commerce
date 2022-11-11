import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';

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

const toCamelCase = (status: string) => {
  return status.replace(/^([A-Z])|[\s-_](\w)/g, (p1, p2) => {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
};

const getStore = () => {
  const { cmsSettings } = config.get();
  return {
    lang: cmsSettings.lang,
    domain: cmsSettings.domain,
    name: cmsSettings.name,
    corporate_name: cmsSettings.name,
    contact_email: cmsSettings.email,
    logo: {
      url: `https://${cmsSettings.domain}${cmsSettings.logo}`,
    },
    address: '', // TODO: cmsSettings.address,
  };
};

export {
  updateOrderSubresource,
  toCamelCase,
  getStore,
};
