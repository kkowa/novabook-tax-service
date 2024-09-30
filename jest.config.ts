import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm', // Use ts-jest's ESM preset
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'], // Treat .ts files as ESM
  globals: {
    'ts-jest': {
      useESM: true, // Enable ESM support in ts-jest
    },
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Remove .js extension when importing
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }], // Use ts-jest for .ts files
  },
  testMatch: ['**/__tests__/**/*.test.ts'], // Specify test file patterns
};

export default config;
