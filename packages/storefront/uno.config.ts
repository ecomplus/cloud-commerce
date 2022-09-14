import {
  defineConfig,
  presetUno,
  transformerDirectives,
  UserConfig,
} from 'unocss';
import presetAttributify from '@unocss/preset-attributify';
import presetIcons from '@unocss/preset-icons';

const genUnoCSSConfig = ({
  brandIcons = 'logos',
  generalIcons = 'heroicons',
  brandShortcuts = [
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'youtube',
    'google',
    'pinterest',
    'tiktok',
    'telegram',
    'whatsapp',
    'messenger',
    'visa',
    'mastercard',
    'paypal',
    'apple-pay',
    'google-pay',
    'amex',
    'elo',
    'hipercard',
    'dinersclub',
  ],
  shoppingCartIcon = 'shopping-bag',
} = {}): UserConfig => ({
  shortcuts: [
    ...brandShortcuts.map((brand) => {
      return { [`i-${brand}`]: `i-${brandIcons}:${brand}` };
    }),
    { 'i-shopping-cart': `i-${generalIcons}:${shoppingCartIcon}` },
    [/^i-([^:]+)$/, ([, icon]) => `i-${generalIcons}:${icon}`],
  ],
  transformers: [
    transformerDirectives(),
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
});

const unoCSSConfig = genUnoCSSConfig();

export default defineConfig(unoCSSConfig);

export { genUnoCSSConfig, unoCSSConfig };
