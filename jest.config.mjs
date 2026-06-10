
const jestConfig = {
  clearMocks: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.spec.ts"],
  extensionsToTreatAsEsm: ['.ts'], 
  // Use the native ESM preset provided by ts-jest
  preset: 'ts-jest/presets/default-esm', 
  
  transform: {
    // Ensure ts-jest processes your TS files as ES Modules
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  
  // Since chrome-har is an ES Module, let Jest resolve it properly
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', 
  },
}

export default jestConfig
