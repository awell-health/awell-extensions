/** @type {import('ts-jest').JestConfigWithTsJest} */
// Make sure jest runs with UTC TZ (to avoid failed tests locally)
process.env.TZ = 'UTC'

module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    // Mock for the driver license validator due to build issue
    'driver-license-validator': '<rootDir>/extensions/metriport/__mocks__/drivers-license-validator.ts',
  },
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
}