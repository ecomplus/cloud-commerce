const fs = require('fs');
const { resolve: resolvePath } = require('path');
const deepmerge = require('@fastify/deepmerge')();
const colors = require('tailwindcss/colors');
const chroma = require('chroma-js');
require('./storefront.cms.js');

let defaultThemeOptions = {
  baseColor: 'slate',
  successColor: 'emerald',
  warningColor: 'amber',
  dangerColor: 'rose',
  // IntelliSense for UnoCSS icons
  brandIcons: 'fa6-brands',
  brandIconsShortcuts: [
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
    'pix',
  ],
  brandLogos: 'logos',
  brandLogosShortcuts: [
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
  generalIcons: 'heroicons',
  iconAliases: {
    close: 'x-mark',
    'chevron-right': 'chevron-right',
    'chevron-left': 'chevron-left',
  },
};
if (globalThis.$storefrontThemeOptions) {
  defaultThemeOptions = deepmerge(defaultThemeOptions, globalThis.$storefrontThemeOptions);
}

const { primaryColor, secondaryColor } = global.__storefrontCMS(fs, resolvePath);
const brandColors = {
  primary: primaryColor,
  secondary: secondaryColor || primaryColor,
  ...globalThis.$storefrontBrandColors,
};
const brandColorsPalletes = {};
const onBrandColors = {};
Object.keys(brandColors).forEach((colorName) => {
  const hex = brandColors[colorName];
  const color = chroma(hex);
  let subtle;
  let bold;
  const luminance = color.luminance();
  if (luminance >= 0.1) {
    subtle = chroma(hex).brighten(1.5);
    bold = chroma(hex).darken(1.25);
  } else if (luminance > 0.03) {
    subtle = chroma(hex).brighten();
    bold = chroma(hex).darken();
  } else {
    subtle = chroma(hex).darken();
    bold = chroma(hex).brighten();
  }
  const pallete = {
    subtle: subtle.css(),
    DEFAULT: color.css(),
    bold: bold.css(),
  };
  const scale = chroma.scale([
    chroma(hex).luminance(0.95), // 50
    chroma(hex).luminance(0.84), // 100
    chroma(hex).luminance(0.73), // 200
    chroma(hex).luminance(0.62), // 300
    chroma(hex).luminance(0.49), // 400
    chroma(hex).luminance(0.35), // 500
    chroma(hex).luminance(0.23), // 600
    chroma(hex).luminance(0.15), // 700
    chroma(hex).luminance(0.10), // 800
    chroma(hex).luminance(0.05), // 900
    chroma(hex).luminance(0.02), // 950
  ]).colors(11);
  scale.forEach((sHex, index) => {
    let palleteIndex;
    if (index === 0) palleteIndex = '50';
    else if (index === scale.length - 1) palleteIndex = '950';
    else palleteIndex = (100 * index).toString();
    pallete[palleteIndex] = chroma(sHex).css();
  });
  brandColorsPalletes[colorName] = pallete;
  const colorVariants = { color, subtle, bold };
  Object.keys(colorVariants).forEach((tone) => {
    const label = tone === 'color' ? colorName : `${colorName}-${tone}`;
    const lightness = colorVariants[tone].get('lab.l');
    if (lightness > 90) {
      onBrandColors[label] = pallete['800'];
    } else if (lightness > 76) {
      onBrandColors[label] = pallete['900'];
    } else if (lightness > 67) {
      onBrandColors[label] = pallete['950'];
    } else {
      onBrandColors[label] = `var(--c-on-${(lightness > 60 ? 'light' : 'dark')})`;
    }
  });
});

const genTailwindConfig = (themeOptions = {}) => {
  const {
    brandIcons,
    brandIconsShortcuts,
    brandLogos,
    brandLogosShortcuts,
    generalIcons,
    baseColor,
    successColor,
    warningColor,
    dangerColor,
    iconAliases,
  } = deepmerge(defaultThemeOptions, themeOptions);
  const config = {
    content: ['./src/**/*.{vue,astro,tsx,jsx,md,html,svelte}'],
    theme: {
      extend: {
        colors: {
          ...brandColorsPalletes,
          on: onBrandColors,
          base: typeof baseColor === 'string' ? colors[baseColor] : baseColor,
          success: typeof successColor === 'string' ? colors[successColor] : successColor,
          warning: typeof warningColor === 'string' ? colors[warningColor] : warningColor,
          danger: typeof dangerColor === 'string' ? colors[dangerColor] : dangerColor,
        },
        fontFamily: {
          sans: ['var(--font-sans)'],
          mono: ['var(--font-mono)'],
          brand: ['var(--font-brand, var(--font-sans))'],
        },
      },
    },
    plugins: [
      ({ addUtilities }) => {
        addUtilities({
          ...Object.keys(onBrandColors).reduce((utilities, colorLabel) => {
            const [colorName, tone] = colorLabel.split('-');
            const textColor = onBrandColors[colorLabel];
            const backgroundColor = brandColorsPalletes[colorName][tone || 'DEFAULT'];
            utilities[`.${colorLabel}`] = {
              'background-color': `var(--c-${colorLabel}, ${backgroundColor})`,
              color: `var(--c-on-${colorLabel}, ${textColor})`,
            };
            return utilities;
          }, {}),
          ...[{
            iconset: generalIcons,
          }, {
            iconset: brandIcons,
            shortcuts: brandIconsShortcuts,
          }, {
            iconset: brandLogos,
            shortcuts: brandLogosShortcuts,
          }].reduce((utilities, { iconset, shortcuts }) => {
            if (iconset) {
              if (!shortcuts) {
                const { icons } = require(`@iconify-json/${iconset}`);
                shortcuts = Object.keys(icons.icons);
                Object.keys(iconAliases).forEach((alias) => {
                  if (alias !== iconAliases[alias]) {
                    shortcuts.push([alias, iconAliases[alias]]);
                  }
                });
              }
              shortcuts.forEach((shortcut) => {
                if (typeof shortcut === 'string') {
                  utilities[`.i-${shortcut}`] = {
                    '--iconify': iconset,
                    '--icon': `"${shortcut}"`,
                  };
                } else {
                  utilities[`.i-${shortcut[0]}`] = {
                    '--iconify': iconset,
                    '--icon': `"${shortcut[1]}"`,
                  };
                }
              });
            }
            return utilities;
          }, {}),
          // require('@tailwindcss/typography'),
          // https://github.com/unocss/unocss/tree/main/packages/preset-typography
          ...['prose', 'not-prose', 'prose-invert'].reduce((utilities, proseClass) => {
            utilities[`.${proseClass}`] = {
              [`--un-${proseClass}`]: 'default',
            };
            return utilities;
          }, {}),
        });
      },
    ],
  };
  const uiElNames = [];
  try {
    const styleCSSFile = resolvePath(process.env.STOREFRONT_BASE_DIR, 'src/assets/style.css');
    const styleCSS = fs.readFileSync(styleCSSFile, 'utf8');
    // '.ui-btn { color: green }; .ui-title { font-size: 18px }'.split(/\.ui-/i)
    // => [ "", "btn { color: green }; ", "title { font-size: 18px }" ]
    styleCSS.split(/[.=]ui-/).forEach((partCSS, i) => {
      if (i === 0) return;
      const elName = partCSS.replace(/[^\w-].*/g, '');
      if (elName) {
        let [, styles] = partCSS.split(/[{}]/);
        if (!styles && /,[\n\s]+$/.test(partCSS)) {
          styles = styleCSS.split(partCSS)[1]?.split(/[{}]/)[1];
        }
        styles = styles?.replace(/\n/g, ' ').trim().replace(/\s\s/g, ' ') || '';
        // .ui-btn -> .ui-btn-primary
        const parentEl = uiElNames.find((el) => elName.startsWith(`${el.elName}-`));
        if (parentEl) {
          styles = `${parentEl.styles} ${styles}`;
        }
        const uiEl = uiElNames.find((el) => el.elName === elName);
        if (!uiEl) {
          uiElNames.push({ elName, styles });
        } else {
          uiEl.styles += ` ${styles}`;
        }
      }
    });
  } catch {
    //
  }
  if (uiElNames.length) {
    config.plugins.push(({ addUtilities }) => {
      addUtilities(uiElNames.reduce((utilities, { elName, styles }) => {
        utilities[`.ui-${elName}`] = {
          [`--${elName}`]: `"${styles}" /* Consistent UI element from assets/style.css */`,
        };
        return utilities;
      }, {}));
    });
  }
  if (globalThis.$storefrontTailwindConfig) {
    return deepmerge(config, globalThis.$storefrontTailwindConfig);
  }
  return config;
};

module.exports = {
  genTailwindConfig,
  defaultThemeOptions,
  brandColors,
  brandColorsPalletes,
  onBrandColors,
};
