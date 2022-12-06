module.exports = {
  extends: '../../.eslintrc.cjs',
  rules: {
    'no-console': 'off',
    semi: 'warn',
    'arrow-parens': 'warn',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
  },
  ignorePatterns: [
    'auto-imports.d.ts',
    'components.d.ts',
  ],
  overrides: [{
    files: [
      'src/**/*.vue',
      'src/**/*.astro',
    ],
    extends: './.eslintrc-auto-import.json',
  }],
};
