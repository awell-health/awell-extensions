/** @type {import('ts-jest').JestConfigWithTsJest} */
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.json')
const { compilerOptions: buildCompilerOptions } = require('./tsconfig.build.json')

// Make sure jest runs with UTC TZ (to avoid failed tests locally)
process.env.TZ = 'UTC'

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  modulePaths: [buildCompilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })
}