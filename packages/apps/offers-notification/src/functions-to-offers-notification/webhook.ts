import type { Response, Request } from 'firebase-functions/v1';
import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
// eslint-disable-next-line import/no-unresolved
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import axios from 'axios';
import ecomUtils from '@ecomplus/utils';

const GET = async (req:Request, res: Response) => {
  const { productId, variationId, stylesheet } = req.query;
  const opt = {
    productId,
    variationId,
    criterias: req.query.criterias || 'out_of_stock',
    recaptchKey: process.env.RECAPTCHA_KEY,
  };

  if (!productId) {
    res.status(400).send('`productId` is required');
  } else {
    try {
      const css = await new Promise((resolve) => {
        if (stylesheet) {
          resolve(stylesheet);
        } else {
          api.get('stores/me')
            .then(({ data }) => {
              if (data.homepage) {
                resolve(`${data.homepage}/storefront.css`);
              } else {
                resolve(null);
              }
            }).catch(() => {
              resolve(null);
            });
        }
      });

      if (css) {
        const product = (await api.get(`products/${productId}`)).data;
        if (product) {
          if (
            variationId
          && (!product.variations || !product.variations.find(({ _id }) => _id === variationId))
          ) {
            throw new Error('Variation not found');
          }
          Object.assign(opt, { product, css });
          // TODO:

          // res.render('offer-notification', {
          //   opt,
          //   _: { ecomUtils },
          // });
        } else {
          res.status(404).send(`Product #${productId} not found`);
        }
      } else {
        res.status(404).send('Stylesheet not found');
      }
    } catch (err) {
      logger.error(err);
      // TODO:
      // res.render('error', { opt, err });
    }
  }
};

const POST = async (req:Request, res: Response) => {
  // TODO: Create process.env.RECAPTCHA_SECRET
  try {
    const { body } = req;
    const token = req.get('X-Google-Token') || body.token;

    if (token) {
      const fields = ['product_id', 'customer_email', 'customer_name', 'customer_criterias'];
      let isValid = true;
      let fieldName = '';
      fields.forEach((field) => {
        if (!body[field]) {
          fieldName = field;
          isValid = false;
        }
      });

      if (isValid) {
        const collection = getFirestore().collection('offer_notifications');

        const { data: recaptcha } = await axios({
          method: 'post',
          url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (recaptcha && recaptcha.success !== false) {
          const querySnapshot = await collection
            .where('product_id', '==', body.product_id)
            .where('variation_id', '==', body.variation_id)
            .where('customer_email', '==', body.customer_email)
            .where('customer_criterias', '==', body.customer_criterias)
            .get();

          if (querySnapshot.empty) {
            const doc = {
              created_at: Timestamp.fromDate(new Date()),
              product_id: body.product_id,
              variation_id: body.variation_id,
              customer_email: body.customer_email,
              customer_name: body.customer_name,
              customer_criterias: body.customer_criterias,
              notified: false,
              product_quantity: 0,
              product_price: 0,
            };

            if (body.customer_criterias === 'price_change') {
              try {
                const product = (await api.get(`products/${body.product_id}`)).data;
                doc.product_price = product.price || 0;
              } catch (error) {
                logger.error(error);
              }
            }

            await collection
              .doc(ecomUtils.randomObjectId())
              .set(doc);
          }
          res.sendStatus(201);
        } else {
          const message = recaptcha ? 'google verify failed' : 'Recaptcha not found';
          res.status(400)
            .send({
              status: 400,
              message,
              code: 'VERIFICATION_FAILED',
            });
        }
      } else {
        res.status(400).send({
          status: 400,
          message: `Missing required prop ${fieldName}`,
        });
      }
    } else {
      res.status(400).send({
        status: 400,
        message: 'X-Google-Token not found',
      });
    }
  } catch (err) {
    logger.error(err);
    res.status(500).send(err);
  }
};

export default async (req: Request, res: Response) => {
  const { method } = req;
  if (method === 'POST') {
    POST(req, res);
  } else if (method === 'GET') {
    GET(req, res);
  } else {
    res.sendStatus(405);
  }
};
