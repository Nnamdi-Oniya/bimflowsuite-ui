module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // Files to run after the test environment is set up
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Module name mapping (for CSS, SCSS, aliases, etc.)
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Handle asset imports (adjust based on your needs)
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.js',
    
    // Handle module aliases (if you use them in tsconfig)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Which files to look for tests
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx,js,jsx}',
    '<rootDir>/src/**/*.spec.{ts,tsx,js,jsx}',
  ],
  
  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  
  // Collect coverage from these files
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx,js,jsx}',
    '!src/**/index.{ts,tsx,js,jsx}',
    '!src/setupTests.ts',
    '!src/test-utils.tsx',
  ],
  
  // Coverage thresholds (adjust as needed)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset modules between tests
  resetModules: true,
};