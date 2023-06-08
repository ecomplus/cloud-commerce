import type { ResourceId } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';

const parseStatus = (status: number) => {
  switch (status) {
    case 0:
    case 1:
    case 2:
      return 'shipped';
    case 3:
    case 4:
      return 'returned';
    case 9:
      return 'delivered';
    default:
      return '';
  }
};

const updateFulfillments = async (
  orderId: ResourceId,
  trackingCode: string,
  eventType: number,
  eventDate: Date,
) => {
  let notes;
  const status = parseStatus(eventType);
  const bodyFulfillments = {
    date_time: eventDate.toISOString(),
    status,
    notification_code: String(trackingCode),
    flags: [
      'app-frenet',
    ],
  } as any; // TODO: incompatible type=> amount;

  if (eventType === 2) {
    notes = 'Entrega está atrasada.';
  } else if (eventType === 4) {
    notes = 'Pedido extraviado.';
  }

  const order = (await api.get(`orders/${orderId}`)).data;
  if (order.fulfillment_status && order.fulfillment_status.current === status) {
    return null;
  }
  await api.post(`orders/${orderId}/fulfillments`, bodyFulfillments);
  if (notes) {
    if (order.notes) {
      notes = `${order.notes}\n${notes}`;
    }
    return api.patch(`orders/${orderId}`, { notes });
  }
  return true;
};

export default updateFulfillments;
