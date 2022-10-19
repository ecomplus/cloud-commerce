// IntelliSense for UnoCSS icons
const defaultIcons = {
  brandIcons: 'bxl',
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
};

const genTailwindConfig = ({
  colorVariants = [
    '50',
    ...[...Array(9).keys()].map((i) => String((i + 1) * 100)),
  ],
  brandIcons = defaultIcons.brandIcons,
  brandIconsShortcuts = defaultIcons.brandIconsShortcuts,
  brandLogos = defaultIcons.brandLogos,
  brandLogosShortcuts = defaultIcons.brandLogosShortcuts,
  generalIcons = defaultIcons.generalIcons,
} = {}) => ({
  theme: {
    extend: {
      colors: {
        // Color vars from Base.astro styles
        ...['primary', 'secondary', 'contrast'].reduce((colors, color) => {
          const colorVariations = ['hover', 'focus', 'inverse'];
          if (color !== 'contrast') {
            colorVariations.push(...colorVariants);
          }
          colors[color] = colorVariations.reduce((colorPalette, variant) => {
            colorPalette[variant] = `var(--${color}-${variant})`;
            return colorPalette;
          }, {
            DEFAULT: `var(--${color})`,
          });
          return colors;
        }, {}),
        ...['surface', 'muted'].reduce((colors, color) => ({
          [color]: {
            DEFAULT: `var(--${color}-color)`,
            border: `var(--${color}-border-color)`,
          },
          ...colors,
        }), {}),
        gray: {
          DEFAULT: 'var(--gray)',
          accent: 'var(--gray-accent)',
        },
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        // https://picocss.com/docs/containers.html
        '.container-fluid': {
          'max-width': 'var(--content-max-width)',
        },
        // https://picocss.com/docs/buttons.html
        ...['primary', 'secondary', 'contrast'].reduce((utilities, color) => ({
          ...utilities,
          [`.${color}`]: {
            '--background-color': `var(--${color})`,
            'background-color': 'var(--background-color)',
            color: `var(--${color}-inverse)`,
          },
        }), {}),
        ...['primary', 'secondary'].reduce((utilities, color) => {
          colorVariants.forEach((variant) => {
            const colorLabel = `${color}-${variant}`;
            let textColor;
            if (Number(variant) <= 100) {
              textColor = 'var(--yiq-text-dark)';
            } else if (Number(variant) >= 900) {
              textColor = 'var(--yiq-text-light)';
            } else {
              textColor = `var(--${colorLabel}-yiq)`;
            }
            utilities[`.${colorLabel}`] = {
              'background-color': `var(--${colorLabel})`,
              color: textColor,
            };
          });
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
              // eslint-disable-next-line
              const { icons } = require(`@iconify-json/${iconset}`);
              shortcuts = Object.keys(icons.icons);
              if (!shortcuts.includes('shopping-cart')) {
                shortcuts.push('shopping-cart');
              }
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
      });
    },
  ],
});

const tailwindConfig = genTailwindConfig();

module.exports = { ...tailwindConfig, genTailwindConfig, defaultIcons };

exports.genTailwindConfig = genTailwindConfig;
exports.tailwindConfig = tailwindConfig;
exports.defaultIcons = defaultIcons;
