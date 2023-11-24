import api from '@cloudcommerce/api';

const defaultAgent = {
  name: 'Cloud Commerce default agent',
  email: 'cloudcommerce-noreply@e-com.plus',
};

export default async (storeId: number, accessToken: string) => {
  const apiConfig = {
    storeId,
    accessToken,
  };
  const { data } = await api.get('authentications', {
    ...apiConfig,
    params: {
      email: defaultAgent.email,
      limit: 1,
    },
  });

  let authenticationId = data.result[0]?._id;
  if (!authenticationId) {
    const { data: { _id } } = await api.post('authentications', {
      ...defaultAgent,
      username: `cloudcomm${Date.now()}`,
      permissions: {
        applications: ['all'],
        brands: ['all'],
        categories: ['all'],
        collections: ['all'],
        grids: ['all'],
        products: ['all'],
        customers: ['all'],
        carts: ['all'],
        orders: ['GET', 'POST', 'PATCH'],
        stores: ['GET', 'PATCH'],
      },
    }, apiConfig);
    authenticationId = _id;
  }

  const { data: apiKey } = await api.get(
    `authentications/${authenticationId}/api_key`,
    apiConfig,
  ) as { data: string };
  return {
    storeId,
    authenticationId,
    apiKey,
  };
};
