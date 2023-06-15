const deepmerge = require('@fastify/deepmerge')();
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
} = require('./storefront.tailwind.cjs');

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
  if (colorCSSVar) {
    colorCSSVars[`rgb-on-${colorLabel}`] = colorCSSVar;
  } else {
    colorCSSVars[`rgb-on-${colorLabel}`] = cssRGB.startsWith('rgb')
      ? cssRGB.substring(4).replace(')', '')
      : cssRGB.replace('--c-', '--rgb-');
  }
});

const genUnoCSSConfig = (_tailwindConfig) => {
  const themeOptions = _tailwindConfig?.themeOptions || {};
  const {
    brandIcons,
    brandIconsShortcuts,
    brandLogos,
    brandLogosShortcuts,
    generalIcons,
    iconAliases,
    preflights = [{
      getCSS: () => {
        const strCSSVars = Object.entries(colorCSSVars)
          .map(([varName, value]) => `--${varName}:${value};`)
          .join(' ');
        return `:root { ${strCSSVars} }`;
      },
    }],
  } = deepmerge(defaultThemeOptions, themeOptions);
  const tailwindConfig = _tailwindConfig || genTailwindConfig(themeOptions);
  const rules = [];
  tailwindConfig.plugins?.forEach((plugin) => {
    plugin({
      addUtilities: (utilities) => {
        Object.keys(utilities).forEach((s) => {
          /* Skip icons, custom UI and prose selectors
          added on tailwind.config.cjs only for IntelliSense */
          if (!s.startsWith('.i-') && !s.startsWith('.ui-') && !s.includes('prose')) {
            rules.push([s.replace('.', ''), utilities[s]]);
          }
        });
      },
    });
  });
  const theme = tailwindConfig.theme.extend;
  return defineConfig({
    preflights,
    rules,
    shortcuts: [
      [/^i-([^:]+)$/, ([, icon]) => `i-${generalIcons}:${icon}`],
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
      ...Object.keys(iconAliases).map((alias) => {
        return { [`i-${alias}`]: `i-${generalIcons}:${iconAliases[alias]}` };
      }),
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
            [colorLabel]: `rgb(var(--rgb-on-${colorLabel}))`,
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
  });
};

exports.genUnoCSSConfig = genUnoCSSConfig;
exports.colorCSSVars = colorCSSVars;
