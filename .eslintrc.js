module.exports = {
  env: {
    es2021: true,
    node: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.eslint.json',
  },
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': ['error', 'never'],
    'no-console': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'class-methods-use-this': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'import/no-dynamic-require': 'off',
    'no-param-reassign': 'off',
    'func-names': 'off',
    'object-curly-newline': 'off',
    'no-use-before-define': 'off',
    'global-require': 'off',
    'max-len': 'off',
    'no-shadow': 'off',
    'no-underscore-dangle': 'off',
    '@typescript-eslint/no-shadow': ['error']
  }
};
