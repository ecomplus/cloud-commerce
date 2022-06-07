/* eslint-disable import/no-extraneous-dependencies */
const rulesChecks = require('@commitlint/rules').default;

const forceTypeCase = (field, parsed) => {
  switch (parsed.type) {
    case 'feat':
    case 'fix':
    case 'refactor':
    case 'perf':
      break;
    default:
      return [true];
  }
  if (!parsed[field]?.trim()) {
    return [false, `${field} is required for type '${parsed.type}'`];
  }
  const checked = rulesChecks[`${field}-case`](parsed, 'always', 'sentence-case');
  if (!checked[0]) {
    return [false, `${checked[1]} for type '${parsed.type}'`];
  }
  return [true];
};

module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'bytype-subject-case': (parsed) => forceTypeCase('subject', parsed),
        'bytype-body-case': (parsed) => forceTypeCase('subject', parsed),
      },
    },
  ],
  rules: {
    'scope-case': [1, 'always', 'lower-case'],
    'subject-case': [0],
    'body-case': [0],
    'bytype-subject-case': [2, 'always'],
    'bytype-body-case': [2, 'always'],
    'body-max-line-length': [2, 'always', 400],
    'footer-max-line-length': [2, 'always', 200],
  },
};
