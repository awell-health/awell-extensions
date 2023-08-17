// Make sure jest runs with UTC TZ (to avoid failed tests locally)
process.env.TZ = 'UTC'
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/.vscode/',
    '<rootDir>/.yalc/',
  ],
}
