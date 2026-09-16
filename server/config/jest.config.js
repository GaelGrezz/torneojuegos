/** @type {import('jest').Config} */
module.exports = {
  rootDir: '..',
  testEnvironment: 'node',
  coverageProvider: 'v8',
  testMatch: ['<rootDir>/__tests__/**/*.js'],
  clearMocks: true
};