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
const setSocialNetworks = () => {
  const { settings } = globalThis.$storefront;
  networkNames.forEach((network: NetworkName) => {
    if (settings[network]) {
      socialNetworks[network] = settings[network];
    }
  });
};
if (import.meta.env.SSR) {
  global.$storefront.onLoad(() => setSocialNetworks());
} else {
  setSocialNetworks();
}

export { socialNetworks };
