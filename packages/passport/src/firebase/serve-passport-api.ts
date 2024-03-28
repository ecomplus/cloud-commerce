import type { Request, Response } from 'firebase-functions';
import type { Customers, ApiError } from '@cloudcommerce/api/types';
import { logger } from 'firebase-functions';
import api from '@cloudcommerce/api';
import { findCustomerByEmail, authenticateCustomer } from './authenticate-customer';

const maskCustomerFields = (customer: Customers) => {
  const safeCustomer: Customers = {
    _id: customer._id,
    store_id: customer.store_id,
    created_at: customer.created_at,
    updated_at: customer.updated_at,
    main_email: customer.main_email, // email already used to identify the customer
    display_name: customer.display_name,
    name: customer.name && {
      given_name: customer.name.given_name,
      family_name: '***',
    },
    registry_type: customer.registry_type,
    state: customer.state,
    enabled: customer.enabled,
    login: customer.login,
    locale: customer.locale,
    accepts_marketing: customer.accepts_marketing,
    birth_date: customer.birth_date,
    pronoun: customer.pronoun,
    currency_id: customer.currency_id,
    currency_symbol: customer.currency_symbol,
    favorites: customer.favorites,
    last_searched_terms: customer.last_searched_terms,
    last_visited_products: customer.last_visited_products,
    phones: customer.phones?.map((phone) => ({
      ...phone,
      number: '000' + phone.number.substring(phone.number.length - 2),
    })),
    addresses: customer.addresses?.map((address) => ({
      zip: address.zip,
      province_code: address.province_code,
      line_address: `${(address.street || address.city)} ***`,
      name: '***',
      default: address.default,
    })),
    orders: customer.orders?.map((order) => ({
      _id: order._id,
      number: order.number,
    })),
  };
  return safeCustomer;
};

export default async (req: Request, res: Response) => {
  let { url } = req;
  if (url.endsWith('.json')) {
    url = url.slice(0, -5);
  }
  url = url.replace('/_api/passport', ''); // due to hosting rewrite
  const endpoint = url.split('/').pop();

  if (endpoint === 'identify') {
    const { body } = req;
    if (body) {
      const email = body.email;
      if (typeof email === 'string' && /^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        const docNumber = body.doc_number ? `${body.doc_number}` : undefined;
        try {
          const customerMatch = await findCustomerByEmail(email, docNumber);
          if (customerMatch) {
            const customerId = customerMatch._id;
            const customer: Partial<Customers> = {
              _id: customerId,
              main_email: email,
              doc_number: docNumber,
            };
            const level = docNumber ? 1 : 0;
            if (level) {
              Object.assign(
                customer,
                maskCustomerFields((await api.get(`customers/${customerId}`)).data),
              );
            }
            res.send({
              customer,
              auth: {
                id: customer._id,
                level,
                token: null,
              },
            });
            return;
          }
          res.status(403).json({
            status: 403,
            error: 'Forbidden, no profile found with email provided',
          });
        } catch (err) {
          logger.error(err);
          res.sendStatus((err as ApiError).statusCode || 500);
        }
      }
    }
    res.sendStatus(400);
    return;
  }

  if (endpoint !== 'token') {
    res.sendStatus(404);
    return;
  }
  const firebaseAuthToken = req.headers.authorization?.split(' ')[1];
  if (!firebaseAuthToken) {
    res.sendStatus(401);
    return;
  }
  try {
    const authCustomerApi = await authenticateCustomer(firebaseAuthToken);
    if (authCustomerApi !== null) {
      res.send(authCustomerApi);
      return;
    }
    res.status(401).json({
      status: 401,
      error: 'Invalid Firebase Auth token, unauthorized',
    });
  } catch (err) {
    logger.error(err);
    res.sendStatus((err as ApiError).statusCode || 500);
  }
};
