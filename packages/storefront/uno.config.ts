import {
  defineConfig,
  presetUno,
  transformerDirectives,
  UserConfig,
  Preflight,
  Rule,
} from 'unocss';
import presetIcons from '@unocss/preset-icons';
import Color from 'color';
import { genTailwindConfig } from './tailwind.config.cjs';
import getCMS from './storefront.cms.mjs';

const { primaryColor, secondaryColor } = getCMS();
const brandColors = {
  primary: primaryColor,
  secondary: secondaryColor,
  ...globalThis.storefront_brand_colors,
};
const colorPalette = {
  50: -0.75,  // whiter
  100: -0.5,  // white
  200: -0.33, // lightest
  300: -0.21, // lighter
  400: -0.1,  // light
  500: 0,
  600: 0.1,   // dark
  700: 0.16,  // darker
  800: 0.22,  // darkest
  900: 0.5,   // black
  ...globalThis.storefront_color_variants,
};
const _colorVariants = Object.keys(colorPalette);
const colorCSSVars: Record<string, string> = {};
Object.keys(brandColors).forEach((colorName) => {
  const color = Color(brandColors[colorName]);
  _colorVariants.forEach((colorVariant) => {
    const colorShift = colorPalette[colorVariant];
    const colorLabel = `${colorName}-${colorVariant}`;
    colorCSSVars[colorLabel] = color.darken(colorShift).hex();
    if (Number(colorVariant) > 100 && Number(colorVariant) < 900) {
      colorCSSVars[`${colorLabel}-yiq`] = color.isLight()
        ? 'var(--yiq-text-dark)' : 'var(--yiq-text-light)';
      colorCSSVars[`${colorLabel}-rgb`] = `${color.red()}, ${color.green()}, ${color.blue()}`;
    }
  });
});

const _preflights: Preflight[] = [{
  getCSS: () => `
    :root {
      ${Object.entries(colorCSSVars).map(([varName, value]) => `--${varName}:${value};`).join('')}
      --content-max-width: 80rem;
      --white: #fff;
      --gray-50: #f9fafb;
      --gray-200: #e5e7eb;
      --gray-400: #94a3b8;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --gray-800: #1f2937;
      --gray-900: #111827;
      --gray: var(--gray-600);
      --gray-accent: var(--gray-800);
      --surface-color: var(--gray-50);
      --surface-border-color: var(--gray-200);
      --yiq-text-light: var(--white);
      --yiq-text-dark: var(--gray-900);
      --primary: var(--primary-500);
      --primary-hover: var(--primary-700);
      --primary-focus: rgba(var(--primary-200-rgb), 0.2);
      --primary-inverse: var(--primary-500-yiq);
      --secondary: var(--secondary-500);
      --secondary-hover: var(--secondary-700);
      --secondary-focus: rgba(var(--secondary-200-rgb), 0.2);
      --secondary-inverse: var(--secondary-500-yiq);
    }
    @media only screen and (prefers-color-scheme: dark) {
      :root:not([data-theme=light]) {
        --gray: var(--gray-400);
        --gray-accent: var(--gray-200);
        --surface-color: var(--gray-800);
        --surface-border-color: var(--gray-700);
      }
    }`,
}];

const genUnoCSSConfig = ({
  colorVariants = _colorVariants,
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
  preflights = _preflights,
}: {
  colorVariants?: string[],
  brandIcons?: string,
  brandIconsShortcuts?: Array<string | [string, string]>,
  brandLogos?: string,
  brandLogosShortcuts?: Array<string | [string, string]>,
  generalIcons?: string,
  shoppingCartIcon?: string,
  preflights?: Preflight[],
} = {}): UserConfig => {
  const tailwindConfig = genTailwindConfig({ colorVariants });
  const rules: Rule[] = [];
  tailwindConfig.plugins?.forEach((plugin) => {
    plugin({
      addUtilities: (utilities: Record<string, { [k: string]: string | number }>) => {
        Object.keys(utilities).forEach((selector) => {
          rules.push([selector.replace('.', ''), utilities[selector]]);
        });
      },
    });
  });
  return {
    preflights,
    rules,
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
      colors: tailwindConfig.theme?.extend?.colors,
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
  };
};

const unoCSSConfig = genUnoCSSConfig();

export default defineConfig(unoCSSConfig);

export {
  genUnoCSSConfig,
  unoCSSConfig,
  brandColors,
  colorPalette,
  colorCSSVars,
};

export const preflights = _preflights;
