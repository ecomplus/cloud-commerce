module.exports = {
  extends: '../../.eslintrc.cjs',
  rules: {
    'no-console': 'off',
    semi: 'warn',
    'arrow-parens': 'warn',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'vue/multi-word-component-names': ['error', {
      ignores: ['Price'],
    }],
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
