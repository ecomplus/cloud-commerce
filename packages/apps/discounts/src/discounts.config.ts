import config from '@cloudcommerce/firebase/lib/config';

export default () => {
  const {
    lang,
    apps: {
      discounts: { appId },
    },
  } = config.get();

  return {
    app_id: appId,
    title: lang.startsWith('en') ? 'Campaigns and discounts' : 'Campanhas e descontos',
    slug: 'discounts',
    type: 'external',
    state: 'active',
    modules: {
      apply_discount: {
        enabled: true,
      },
    },
    auth_scope: {
      orders: ['GET'],
    },
    admin_settings: {
    },
  };
};
