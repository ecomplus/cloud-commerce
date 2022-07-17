import { fetch } from 'zx';
import api from '@cloudcommerce/api';

const defaultAgent = {
  name: 'Cloud Commerce default agent',
  email: 'cloudcommerce-noreply@e-com.plus',
};

export default async (storeId: number, accessToken: string) => {
  const apiConfig = {
    storeId,
    accessToken,
    fetch: fetch as Window['fetch'],
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
        brands: ['GET'],
        carts: ['all'],
        categories: ['GET'],
        collections: ['GET'],
        customers: ['all'],
        grids: ['GET'],
        orders: ['GET', 'POST', 'PATCH'],
        products: ['GET', 'PATCH'],
        stores: ['GET'],
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
