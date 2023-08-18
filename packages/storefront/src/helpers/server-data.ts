const {
  settings,
  apiContext,
} = globalThis.$storefront;

const networkNames = [
  'whatsapp',
  'instagram',
  'facebook',
  'twitter',
  'youtube',
  'tiktok',
  'pinterest',
  'threads',
] as const;

export type NetworkName = typeof networkNames[number];

const socialNetworks: Partial<Record<NetworkName, string>> = {};
networkNames.forEach((network: NetworkName) => {
  if (settings[network]) {
    socialNetworks[network] = settings[network];
  }
});

export { settings, apiContext, socialNetworks };

export const serviceLinks = settings.service_links;

export const paymentMethodFlags = settings.payment_methods;

export type PaymentMethodFlag = Exclude<typeof paymentMethodFlags, undefined>[number];
