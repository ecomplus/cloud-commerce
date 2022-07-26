/* eslint-disable import/prefer-default-export */
import type { AppEventsTopic } from '@cloudcommerce/types';

type EventSub = {
  event: AppEventsTopic,
  appId: number,
};

export type {
  EventSub,
};
