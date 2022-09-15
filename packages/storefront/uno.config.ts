import {
  defineConfig,
  presetUno,
  transformerDirectives,
  UserConfig,
} from 'unocss';
import presetAttributify from '@unocss/preset-attributify';
import presetIcons from '@unocss/preset-icons';

const brandColorVariations = [
  'whiter',
  'white',
  'lightest',
  'lighter',
  'light',
  'lighten',
  'base',
  'darken',
  'dark',
  'darker',
  'darkest',
  'black',
];
if (global.storefront_color_variations) {
  Object.keys(global.storefront_color_variations).forEach((variation) => {
    brandColorVariations.push(variation);
  });
}

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
  theme: {
    colors: ['primary', 'secondary', 'contrast'].reduce((colors, color) => {
      const colorVariations = ['hover', 'focus', 'inverse'];
      if (color !== 'contrast') {
        colorVariations.push(...brandColorVariations);
      }
      colors[color] = colorVariations.reduce((colorPalette, variation) => {
        colorPalette[variation] = `var(--${color}-${variation})`;
        return colorPalette;
      }, {
        DEFAULT: `var(--${color})`,
      });
      return colors;
    }, {}),
  },
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
