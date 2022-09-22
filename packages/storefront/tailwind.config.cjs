const genTailwindConfig = ({
  colorVariants = [
    '50',
    ...[...Array(9).keys()].map((i) => String((i + 1) * 100)),
  ],
} = {}) => ({
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
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
      });
    },
  ],
});

const tailwindConfig = genTailwindConfig();

module.exports = { ...tailwindConfig, genTailwindConfig };

exports.genTailwindConfig = genTailwindConfig;
exports.tailwindConfig = tailwindConfig;
