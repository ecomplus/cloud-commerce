import type { ApiEventName, Resource } from '@cloudcommerce/types';
import type { ApiConfig } from '@cloudcommerce/api';

/* Maps an `ApiEventName` to the Store API `events/<resource>` query params.
Kept free of side effects (no Firebase, no config) so it can be unit tested. */
export const parseEventName = (
  evName: ApiEventName,
  baseApiEventsFilter: Record<string, string>,
) => {
  const [resource, actionName] = evName.split('-');
  const params: ApiConfig['params'] = { ...baseApiEventsFilter };
  const bodySet: { [key: string]: any } = {};
  if (actionName === 'new' || actionName === 'delayed') {
    params.action = 'create';
  } else {
    switch (resource) {
      case 'orders':
        switch (actionName) {
          case 'paid':
            bodySet['financial_status.current'] = 'paid';
            break;
          case 'readyForShipping':
            bodySet['fulfillment_status.current'] = 'ready_for_shipping';
            break;
          case 'shipped':
          case 'delivered':
            bodySet['fulfillment_status.current'] = actionName;
            break;
          case 'cancelled':
            bodySet.status = 'cancelled';
            break;
          default: // anyStatusSet
            params.modified_fields = [
              'financial_status',
              'fulfillment_status',
              'status',
            ];
        }
        break;
      case 'products':
        params.modified_fields = actionName === 'priceSet'
          ? ['price', 'variations.price']
          : ['quantity']; // quantitySet
        break;
      case 'carts':
        params.modified_fields = ['customers']; // customerSet
        break;
      case 'applications':
        params.modified_fields = ['data', 'hidden_data']; // dataSet
        break;
      case 'customers':
        params.modified_fields = actionName === 'staffSignatureSet'
          ? ['staff_signature']
          : ['enabled']; // enabledSet
        break;
      default:
    }
  }
  Object.keys(bodySet).forEach((field) => {
    params[`body.${field}`] = bodySet[field];
  });
  return { resource, params, actionName } as {
    resource: Resource,
    params: Exclude<ApiConfig['params'], undefined | string>,
    actionName: string
  };
};

export default parseEventName;
