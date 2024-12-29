module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next',
    'next/core-web-vitals',
    'plugin:prettier/recommended', // Включает eslint-config-prettier и eslint-plugin-prettier
  ],
  rules: {
    // Ваши пользовательские правила
    'prettier/prettier': 'error',
  },
};
