module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'warn',
    '@next/next/no-img-element': 'warn',
    'prefer-spread': 'warn',
    'react-hooks/rules-of-hooks': 'error', // Keep this as error
  },
}
