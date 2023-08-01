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
] as const;
type NetworkName = typeof networkNames[number];
const socialNetworks: Partial<Record<NetworkName, string>> = {};
networkNames.forEach((network: NetworkName) => {
  if (settings[network]) {
    socialNetworks[network] = settings[network];
  }
});

export { settings, apiContext, socialNetworks };

export type { NetworkName };
