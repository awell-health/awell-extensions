/** @type {import('ts-jest').JestConfigWithTsJest} */
// Make sure jest runs with UTC TZ (to avoid failed tests locally)
process.env.TZ = 'UTC'

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
}