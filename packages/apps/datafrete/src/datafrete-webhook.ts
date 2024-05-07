/* eslint-disable import/prefer-default-export */
import type { Request, Response } from 'firebase-functions';
import type { Orders } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import getEnv from '@cloudcommerce/firebase/lib/env';
import functions from 'firebase-functions/v1';
import logger from 'firebase-functions/logger';

const handleWebhook = async (req: Request, res: Response) => {
  const operatorToken = process.env.DATAFRETE_OPERATOR_TOKEN || getEnv().apiAuth.apiKey;

  if (operatorToken !== req.get('x-operator-token')) {
    return res.sendStatus(401);
  }

  const {
    order_update: {
      number,
      fulfillment,
      invoices,
      tracking_codes: trackingCodes,
    },
  } = req.body;

  if (!number || !fulfillment || !fulfillment.status) {
    return res.sendStatus(400);
  }
  logger.log('> Webhook #', number);

  const order = (await api.get(
    `orders?number=${number}&fields=_id,fulfillment_status,shipping_lines&limit=1`,
  )).data.result[0];

  if (!order) {
    return res.sendStatus(404);
  }
  let shippingLineId = fulfillment.shipping_line_id;
  let shippingLine: Exclude<Orders['shipping_lines'], undefined>[number] | undefined;

  if (order.shipping_lines) {
    if (!shippingLineId) {
      for (let i = 0; i < order.shipping_lines.length; i++) {
        if (order.shipping_lines[i].flags && order.shipping_lines[i]?.flags?.includes('datafrete-ws')) {
          shippingLine = order.shipping_lines[i];
          shippingLineId = shippingLine && shippingLine._id;
          break;
        }
      }
    } else {
      shippingLine = order.shipping_lines.find(({ _id }) => _id === shippingLineId);
    }
    if (!shippingLine && order.shipping_lines) {
      [shippingLine] = order.shipping_lines;
    }
  }
  const isShippingLineUpdate = shippingLine
    && ((invoices && invoices.length) || (trackingCodes && trackingCodes.length));

  if (order.fulfillment_status && order.fulfillment_status.current === fulfillment.status) {
    if (!isShippingLineUpdate) {
      logger.log('>>(App datafrete) Nothing to change on shipping line:', shippingLineId, order._id);
      return res.sendStatus(304);
    }
  } else {
    fulfillment.flags = ['datafrete'];
    try {
      await api.post(
        `orders/${order._id}/fulfillments`,
        fulfillment,
      );
      logger.log('>(App datafrete) Fulfillment inserted:', fulfillment.status);
      if (!isShippingLineUpdate) {
        return res.sendStatus(200);
      }
    } catch (error: any) {
      logger.error('>(App datafrete) => ', error);
      if (error.response && error.response.status) {
        return res.status(error.response.status).send(error.response.data);
      }
      return res.sendStatus(500);
    }
  }

  if (isShippingLineUpdate) {
    logger.log('>(App datafrete) Updating shipping line:', shippingLineId, order._id);
    try {
      await api.patch(
        `orders/${order._id}/shipping_lines/${(shippingLineId || '0')}`,
        { invoices, tracking_codes: trackingCodes },
      );
      logger.log('>(App datafrete) Shipping line invoices/tracking updated');
      res.sendStatus(200);
    } catch (error: any) {
      if (error.response) {
        let { message } = error;
        if (error.response.data) {
          if (typeof error.response.data === 'object') {
            message += `\n${JSON.stringify(error.response.data)}`;
          } else {
            message += `\n${error.response.data}`;
          }
        }
        if (error.config && error.config.url) {
          message += `\n${error.config.url}`;
        }
        logger.error('>(App datafrete) =>', new Error(message));
        return res.status(error.response.status || 500)
          .send(error.response.data);
      }
      logger.error('>(App datafrete) => ', error);
      return res.sendStatus(500);
    }
  }

  return res.sendStatus(500);
};

const { httpsFunctionOptions } = config.get();

export const datafrete = {
  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest(async (req, res) => {
      const { method } = req;
      if (method === 'POST') {
        handleWebhook(req, res);
      } else {
        res.sendStatus(405);
      }
    }),
};
