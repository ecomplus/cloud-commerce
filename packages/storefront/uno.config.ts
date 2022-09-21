import {
  defineConfig,
  presetUno,
  transformerDirectives,
  UserConfig,
} from 'unocss';
import presetIcons from '@unocss/preset-icons';
import { genTailwindConfig } from './tailwind.config.cjs';

const genUnoCSSConfig = ({
  colorVariants,
  brandIcons = 'bxl',
  brandIconsShortcuts = [
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
  ],
  brandLogos = 'logos',
  brandLogosShortcuts = [
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
  generalIcons = 'heroicons',
  shoppingCartIcon = 'shopping-bag',
}: {
  colorVariants?: string[],
  brandIcons?: string,
  brandIconsShortcuts?: Array<string | [string, string]>,
  brandLogos?: string,
  brandLogosShortcuts?: Array<string | [string, string]>,
  generalIcons?: string,
  shoppingCartIcon?: string,
} = {}): UserConfig => ({
  shortcuts: [
    ...brandIconsShortcuts.map((brand) => {
      return typeof brand === 'string'
        ? { [`i-${brand}`]: `i-${brandIcons}:${brand}` }
        : { [`i-${brand[0]}`]: `i-${brandIcons}:${brand[1]}` };
    }),
    ...brandLogosShortcuts.map((brand) => {
      return typeof brand === 'string'
        ? { [`i-${brand}`]: `i-${brandLogos}:${brand}` }
        : { [`i-${brand[0]}`]: `i-${brandLogos}:${brand[1]}` };
    }),
    { 'i-shopping-cart': `i-${generalIcons}:${shoppingCartIcon}` },
    [/^i-([^:]+)$/, ([, icon]) => `i-${generalIcons}:${icon}`],
  ],
  theme: {
    colors: genTailwindConfig({ colorVariants }).theme.extend.colors,
  },
  transformers: [
    transformerDirectives(),
  ],
  presets: [
    presetUno(),
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
