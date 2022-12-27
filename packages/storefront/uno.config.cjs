const { join: joinPath } = require('path');

const {
  defineConfig,
  presetUno,
  presetIcons,
  presetTypography,
  transformerCompileClass,
  transformerDirectives,
} = require('unocss');

const {
  genTailwindConfig,
  defaultThemeOptions,
  brandColors,
  brandColorsPalletes,
  onBrandColors,
} = require(joinPath(process.cwd(), 'tailwind.config.cjs'));

const colorCSSVars = {};
Object.keys(brandColors).forEach((colorName) => {
  Object.keys(brandColorsPalletes[colorName]).forEach((tone) => {
    const cssRGB = brandColorsPalletes[colorName][tone];
    const colorLabel = tone === 'DEFAULT' ? colorName : `${colorName}-${tone}`;
    colorCSSVars[`rgb-${colorLabel}`] = cssRGB.substring(4).replace(')', ''); // rgb(rgb) -> rgb
    if (!/\d/.test(tone)) {
      colorCSSVars[`c-${colorLabel}`] = cssRGB;
      colorCSSVars[`c-on-${colorLabel}`] = onBrandColors[colorLabel];
    }
  });
});
Object.keys(onBrandColors).forEach((colorLabel) => {
  const cssRGB = onBrandColors[colorLabel];
  const [colorName] = colorLabel.split('-');
  const colorCSSVar = Object.keys(colorCSSVars).find((varName) => {
    return `rgb(${colorCSSVars[varName]})` === cssRGB
      && new RegExp(`${colorName}-\\d`).test(varName);
  });
  colorCSSVars[`rgb-on-${colorLabel}`] = colorCSSVar
    ? `var(--${colorCSSVar})`
    : cssRGB.substring(4).replace(')', '');
});

const genUnoCSSConfig = ({
  brandIcons = defaultThemeOptions.brandIcons,
  brandIconsShortcuts = defaultThemeOptions.brandIconsShortcuts,
  brandLogos = defaultThemeOptions.brandLogos,
  brandLogosShortcuts = defaultThemeOptions.brandLogosShortcuts,
  generalIcons = defaultThemeOptions.generalIcons,
  shoppingCartIcon = defaultThemeOptions.shoppingCartIcon,
  cashbackIcon = defaultThemeOptions.cashbackIcon,
  preflights = [{
    getCSS: () => {
      const strCSSVars = Object.entries(colorCSSVars)
        .map(([varName, value]) => `--${varName}:${value};`)
        .join(' ');
      return `:root { ${strCSSVars} }`;
    },
  }],
} = {}) => {
  const tailwindConfig = genTailwindConfig();
  const rules = [];
  tailwindConfig.plugins?.forEach((plugin) => {
    plugin({
      addUtilities: (utilities) => {
        Object.keys(utilities).forEach((selector) => {
          // Skip icons and prose selectors added on tailwind.config.cjs only for IntelliSense
          if (!selector.startsWith('.i-') && !selector.includes('prose')) {
            rules.push([selector.replace('.', ''), utilities[selector]]);
          }
        });
      },
    });
  });
  const theme = tailwindConfig.theme.extend;
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
      { 'i-cashback': `i-${generalIcons}:${cashbackIcon}` },
      [/^i-([^:]+)$/, ([, icon]) => `i-${generalIcons}:${icon}`],
    ],
    theme: {
      ...theme,
      colors: {
        ...theme.colors,
        // Generate runtime themeable brand colors utilities with CSS vars
        ...Object.keys(brandColors).reduce((colors, colorName) => {
          colors[colorName] = {};
          Object.keys(brandColorsPalletes[colorName]).forEach((tone) => {
            const colorLabel = tone === 'DEFAULT' ? colorName : `${colorName}-${tone}`;
            colors[colorName][tone] = `rgb(var(--rgb-${colorLabel}))`;
          });
          return colors;
        }, {}),
        on: Object.keys(onBrandColors).reduce((onColors, colorLabel) => {
          return {
            ...onColors,
            colorLabel: `rgb(var(--rgb-on-${colorLabel}))`,
          };
        }, {}),
      },
    },
    transformers: [
      transformerDirectives(),
      transformerCompileClass(),
    ],
    presets: [
      presetUno(),
      presetIcons({
        extraProperties: {
          display: 'inline-block',
          'vertical-align': 'middle',
          'margin-bottom': '0.22rem',
        },
      }),
      presetTypography(),
    ],
  };
};

const unoCSSConfig = genUnoCSSConfig();

exports.default = defineConfig(unoCSSConfig);

exports.genUnoCSSConfig = genUnoCSSConfig;
exports.unoCSSConfig = unoCSSConfig;
exports.colorCSSVars = colorCSSVars;
