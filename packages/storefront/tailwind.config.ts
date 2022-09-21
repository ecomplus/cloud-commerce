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
            DEFAULT: 'var(--muted-color)',
            border: 'var(--muted-border-color)',
          },
          ...colors,
        }), {}),
      },
    },
  },
});

const tailwindConfig = genTailwindConfig();

export default tailwindConfig;

export { genTailwindConfig, tailwindConfig };
