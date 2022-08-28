export const EVENT_SKIP_FLAG = '_skip';

export const GET_PUBSUB_TOPIC = (appId: number) => {
  return `app${appId}_api_events`;
};
