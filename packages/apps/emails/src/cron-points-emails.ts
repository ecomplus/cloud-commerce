import { logger } from '@cloudcommerce/firebase/lib/config';
import api from '@cloudcommerce/api';
import { sendEmail } from '@cloudcommerce/emails';
import { getStore, getMailRender } from './util/emails-utils';

const sendPointsEmails = async () => {
  const store = getStore();
  if (store.lang && store.lang !== 'pt_br') {
    return;
  }
  const startDate = new Date();
  startDate.setHours(startDate.getHours() + 8);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 10);
  const {
    data: { result: customers },
  } = await api.get('customers', {
    params: {
      'loyalty_points_entries.valid_thru>': startDate.toISOString(),
      'loyalty_points_entries.valid_thru<': endDate.toISOString(),
      'loyalty_points_entries.active_points>': 0,
    },
    fields: [
      '_id',
      'display_name',
      'main_email',
      'loyalty_points_entries',
    ] as const,
    sort: ['-updated_at'],
    limit: 300,
  });
  if (!customers.length) {
    return;
  }
  const render = await getMailRender('generic');
  const subject = `Seus pontos na ${store.name} estão expirando`;
  const startDateTime = startDate.getTime();
  const endDateTime = endDate.getTime();
  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    const activePoints = customer.loyalty_points_entries?.filter((pointsEntry) => {
      if (!pointsEntry.active_points) return false;
      const validThruTime = pointsEntry.valid_thru
        && new Date(pointsEntry.valid_thru).getTime();
      if (!validThruTime) return false;
      return validThruTime >= startDateTime && validThruTime <= endDateTime;
    });
    if (!activePoints?.length) {
      logger.warn(`Customer ${customer._id} skipped with no active points`, {
        customer,
      });
      continue;
    }
    const pointsToExpire = activePoints.reduce((acc, pointsEntry) => {
      return acc + pointsEntry.active_points;
    }, 0);
    if (pointsToExpire > 0) {
      // eslint-disable-next-line no-await-in-loop
      const html = await render(
        store,
        {
          'title': subject,
          'subtitle': 'Você tem pontos na loja, utilize antes de expirar ;)',
          'body': `
          Compre em nossa loja com desconto usando os
          <b>${pointsToExpire} pontos</b>
          ativos na sua conta.
          <b>Seus pontos estão expirando</b>,
          aproveite enquanto disponíveis!
          `,
          'button_text': 'Usar meus pontos',
          'button_link': `https://${store.domain}/`
            + '?utm_source=ecomplus&utm_medium=email&utm_campaign=loyalty_points',
        },
        'pt_br',
      );
      if (html) {
        // eslint-disable-next-line no-await-in-loop
        await sendEmail(
          {
            to: [{
              name: customer.display_name,
              email: customer.main_email,
            }],
            subject,
            html,
          },
        );
        logger.info(`Sending points expiration email to ${customer.main_email}`, {
          customer,
          html,
        });
      }
    }
  }
};

export default sendPointsEmails;
