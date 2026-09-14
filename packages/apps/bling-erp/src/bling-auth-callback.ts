import type { Request, Response } from 'firebase-functions/v1';
import { Timestamp } from 'firebase-admin/firestore';
import api from '@cloudcommerce/api';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import updateAppData from '@cloudcommerce/firebase/lib/helpers/update-app-data';
import blingAuth from './bling-auth/create-auth';
import getTokensDocRef, { EXPIRES_IN_GAP_SEC } from './bling-auth/tokens-doc';
import { createBlingClient } from './bling-auth/client';

/*
Receives the redirect from Bling authorization flow with the `code` to be
exchanged for access/refresh tokens:
https://developer.bling.com.br/aplicativos#fluxo-de-autoriza%C3%A7%C3%A3o
*/
export default async (req: Request, res: Response) => {
  const { code, state } = req.query;
  if (typeof code !== 'string' || !code) {
    res.status(400).send('Missing `code` on Bling authorization callback');
    return;
  }
  logger.info(`>> Bling authorization callback (state: ${state})`);

  const { apps: { blingErp: { appId } } } = config.get();
  const application = (await api.get(`applications/app_id:${appId}`)).data;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  const { client_id: clientId, client_secret: clientSecret } = appData;
  if (!clientId || !clientSecret) {
    res.status(409).send('Missing Bling `client_id`/`client_secret` on app settings');
    return;
  }

  try {
    const data = await blingAuth(clientId, clientSecret, code);
    const now = Timestamp.now();
    await getTokensDocRef(clientId).set({
      ...data,
      expiredAt: Timestamp
        .fromMillis(now.toMillis() + ((data.expires_in - EXPIRES_IN_GAP_SEC) * 1000)),
      createdAt: now,
      updatedAt: now,
      isBloqued: false,
      isRateLimit: false,
      countErr: 0,
    });
  } catch (err: any) {
    logger.error(err);
    res.status(400).send('Failed getting Bling tokens, check the app credentials');
    return;
  }

  try {
    const bling = createBlingClient(appData);
    const contatosTipos = await bling.get('/contatos/tipos').then(({ data }) => data?.data);
    const contatTypeClient = contatosTipos?.find(({ descricao }) => descricao === 'Cliente');
    if (contatTypeClient) {
      const otherConfig = {
        ...appData.other_config,
        _contatTypeClientId: contatTypeClient.id,
      };
      await updateAppData(application, { other_config: otherConfig }, {
        isHiddenData: true,
      });
    }
  } catch (err: any) {
    logger.warn(`Failed setting Bling contact type: ${err.message}`);
  }

  res.redirect(`https://app.e-com.plus/#/apps/edit/${appId}/`);
};
