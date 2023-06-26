import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';

export default () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const { metafields } = config.get();
    let appData;
    try {
      const app = (await api.get(
        `applications?app_id=${config.get().apps.flashCourier.appId}&fields=hidden_data,data`,
      )).data.result;

      appData = {
        ...app[0].data,
        ...app[0].hidden_data,
      };
    } catch (err) {
      logger.error(err);
      reject(err);
    }

    if (appData) {
      let contract;
      if (process.env.FLASHCOURIER_CONTRACT) {
        try {
          contract = JSON.parse(process.env.FLASHCOURIER_CONTRACT);
        } catch (e) {
          logger.error(e);
          contract = appData.flashcourier_contract;
        }
      } else {
        contract = appData.flashcourier_contract;
      }

      if (contract) {
        const {
          login,
          password,
          hmac,
          client_id: clientId,
          cct_id: cctIds,
        } = contract;

        if (login && password && hmac && clientId && cctIds) {
          let flashcourierToken;
          try {
            const { data } = await axios({
              method: 'post',
              url: 'https://webservice.flashpegasus.com.br/FlashPegasus/rest/api/v1/token',
              headers: {
                Authorization: hmac,
              },
              data: {
                login,
                senha: password,
              },
            });
            flashcourierToken = data.access_token;
          } catch (err) {
            logger.error(err);
          }
          if (!flashcourierToken) return;

          //
          let orders;
          const ordersEndpoint = 'orders?fields=_id,number,fulfillment_status'
            + '&flags=flashcr-ws'
            + '&fulfillment_status.current!=delivered'
            + `&created_at>=${new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()}`;
          try {
            const { result } = (await api.get(ordersEndpoint)).data;
            orders = result;
          } catch (err) {
            logger.error(err);
          }
          if (!orders.length) return;
          try {
            const { data: { hawbs } } = await axios({
              method: 'post',
              url: 'https://webservice.flashpegasus.com.br/FlashPegasus/rest/padrao/v2/consulta',
              headers: {
                Authorization: flashcourierToken,
              },
              data: {
                clienteId: Number(clientId),
                cttId: cctIds.split(',').map((id) => Number(id.trim())),
                numEncCli: orders.map(({ number }) => {
                  if (metafields.flashCourierNumberPrefix) {
                    return `${metafields.flashCourierNumberPrefix}${number}`;
                  }
                  return String(number);
                }),
              },
            });
            const requests = [];
            for (let i = 0; i.length < hawbs.length; i++) {
              const hawb = hawbs[i];
              const order = orders.find(({ number }) => {
                return Number(hawb.meuNumero.replace(/\D/g, '')) === number;
              });
              if (!order) {
                logger.warn(`[tracking] cannot match order for ${JSON.stringify(hawb)}`);
              } else {
                hawb.historico.sort((a, b) => {
                  if (a.ocorrencia && b.ocorrencia) {
                    const [aDay, aMonth, aYear, aHour, aMin] = a.ocorrencia.split(/\D/);
                    const [bDay, bMonth, bYear, bHour, bMin] = b.ocorrencia.split(/\D/);
                    if (`${aYear}${aMonth}${aDay}${aHour}${aMin}` > `${bYear}${bMonth}${bDay}${bHour}${bMin}`) {
                      return 1;
                    }
                    return -1;
                  }
                  return 0;
                });
                const { eventoId } = hawb.historico[hawb.historico.length - 1];
                let status;
                switch (eventoId) {
                  case '1100':
                    status = 'ready_for_shipping';
                    break;
                  case '1400':
                    status = 'shipped';
                    break;
                  case '4250':
                  case '4300':
                  case '5000':
                    status = 'delivered';
                    break;
                  case '6100':
                    status = 'returned';
                    break;
                  default:
                }
                if (
                  status
                  && (!order.fulfillment_status || order.fulfillment_status.current !== status)
                ) {
                  requests.push(
                    api.post(`orders/${order._id}/fulfillments`, {
                      status,
                      flags: ['flashcr'],
                    }),
                  );
                }
              }
            }
            if (requests.length) {
              await Promise.all(requests);
            }
            resolve(null);
          } catch (err) {
            logger.error(err);
          }
        }
      }
    }
  });
};
