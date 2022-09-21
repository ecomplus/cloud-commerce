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
});

const tailwindConfig = genTailwindConfig();

module.exports = { ...tailwindConfig, genTailwindConfig };

exports.genTailwindConfig = genTailwindConfig;
exports.tailwindConfig = tailwindConfig;
