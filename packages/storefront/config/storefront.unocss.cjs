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
  const shortcuts = [];
  const variants = [];
  tailwindConfig.plugins?.forEach((plugin) => {
    plugin({
      addUtilities: (utilities) => {
        Object.keys(utilities).forEach((s) => {
          /* Skip icons, custom UI and prose selectors
          added on tailwind.config.cjs only for IntelliSense */
          if (s.startsWith('.i-')) {
            const {
              '--collection': iconset,
              '--icon': icon,
            } = utilities[s];
            shortcuts.push({ [s.replace('.', '')]: `i-${iconset}-${icon}` });
          } else if (!s.startsWith('.ui-') && !s.includes('prose')) {
            rules.push([s.replace('.', ''), utilities[s]]);
          }
        });
      },
      addVariant: (variant, selector) => {
        variants.push((matcher) => {
          if (!matcher.startsWith(`${variant}:`)) return matcher;
          return {
            matcher: matcher.slice(variant.length + 1),
            selector: (s) => selector.replace('&', s),
          };
        });
      },
    });
  });
  const {
    colors: themeColors,
    animation: themeAnimation,
    keyframes: themeKeyframes,
    ...theme
  } = tailwindConfig.theme.extend;
  if (themeAnimation) {
    rules.push([
      new RegExp(`^animate-(${Object.keys(themeAnimation).join('|')})$`),
      ([, animation]) => {
        let keyframes = '';
        const keyframesObj = themeKeyframes?.[animation];
        if (keyframesObj) {
          Object.keys(keyframesObj).forEach((point) => {
            const css = keyframesObj[point];
            keyframes += ` ${point} {`;
            Object.keys(css).forEach((prop) => {
              keyframes += ` ${prop}: ${css[prop]};`;
            });
            keyframes += ' }';
          });
        }
        return [
          keyframes
            ? `@keyframes ${animation} {${keyframes} }`
            : '',
          { animation: themeAnimation[animation] },
        ];
      },
    ]);
  }
  return defineConfig({
    preflights,
    rules,
    shortcuts,
    variants,
    theme: {
      ...theme,
      colors: {
        ...themeColors,
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
