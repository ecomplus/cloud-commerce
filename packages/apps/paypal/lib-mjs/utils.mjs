// eslint-disable-next-line import/no-extraneous-dependencies
import config from '@cloudcommerce/firebase/lib/config';

const getStore = () => {
  const { cmsSettings } = config.get();
  return {
    lang: cmsSettings.lang,
    domain: cmsSettings.domain,
    name: cmsSettings.name,
    corporate_name: cmsSettings.corporate_name || cmsSettings.name,
    contact_email: cmsSettings.email,
    logo: {
      url: `https://${cmsSettings.domain}${cmsSettings.logo}`,
    },
    address: cmsSettings.address,
  };
};

const responseError = (status, error, message) => {
  return {
    status: status || 409,
    error,
    message,
  };
};

export {
  responseError,
  getStore,
};
