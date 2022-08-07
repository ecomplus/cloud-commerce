import type { Request, Response } from 'firebase-functions';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
import api, { ApiEndpoint } from '@cloudcommerce/api';
import config from '../config';

export default async (req: Request, res: Response) => {
  const { storeId, apps } = config.get();
  const { body } = req;
  if (
    Number(req.get('X-Store-ID')) === storeId
    && body && body.store_id === storeId
  ) {
    const { application, authentication } = body;
    if (application && authentication) {
      const matchApp = Object.keys(apps).find((slug) => {
        return apps[slug].appId === application.app_id;
      });
      if (matchApp) {
        const authenticationId = authentication.authentication_id;
        const firestoreDoc = getFirestore().doc(`installedApps/${authenticationId}`);
        const installedApp = await firestoreDoc.get();
        if (installedApp.exists) {
          res.sendStatus(200);
          return;
        }

        const appDataEndpoint: ApiEndpoint = `applications/${application._id}/hidden_data`;
        try {
          await api.patch(appDataEndpoint, {
            __installedAt: new Date().toISOString(),
          }, {
            authenticationId: authentication._id,
            apiKey: authentication.api_key,
          });
        } catch (e) {
          res.sendStatus(403);
          return;
        }

        // Received app authentication is valid
        await firestoreDoc.set({ application, authentication });
        res.sendStatus(201);
        return;
      }
    }
  }
  res.sendStatus(400);
};
