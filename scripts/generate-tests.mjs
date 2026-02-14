// scripts/generate-good-tests.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================');
console.log('  Generating better component tests  ');
console.log('         BIM-Flow-Suite 2025         ');
console.log('====================================\n');

const SRC_DIR = 'src';
const TEST_DIR = 'src/test';
const SKIP_DIRECTORIES = ['node_modules', 'test', '__mocks__', 'dist'];
const SKIP_FILENAMES = [
  'main.tsx',
  'App.tsx',
  'App.test.tsx',
  'setupTests.ts',
  'vite-env.d.ts',
  'index.tsx',
  'reportWebVitals.ts',
];

// ────────────────────────────────────────────────
function shouldSkipFile(filePath) {
  const base = path.basename(filePath);
  if (SKIP_FILENAMES.includes(base)) return true;

  const dirParts = path.dirname(filePath).split(path.sep);
  return dirParts.some(part => SKIP_DIRECTORIES.includes(part));
}

// ────────────────────────────────────────────────
function findAllTsxFiles(dir = SRC_DIR) {
  let files = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_DIRECTORIES.includes(entry.name)) {
        files = files.concat(findAllTsxFiles(fullPath));
      }
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.tsx') &&
      !entry.name.includes('.test.') &&
      !entry.name.includes('.spec.') &&
      !shouldSkipFile(fullPath)
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// ────────────────────────────────────────────────
function getImportPath(filePath) {
  // Turns src/components/ui/Button.tsx → @/components/ui/Button
  let relative = path.relative(SRC_DIR, filePath);
  relative = relative.replace(/\.tsx$/, '');
  relative = relative.replace(/\\/g, '/');
  return `@/${relative}`;
}

// ────────────────────────────────────────────────
function generateTestContent(componentName, importPath) {
  return `// ----------------------------------------------------------------
import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
// import { AuthProvider } from '@/contexts/AuthContext';        // ← uncomment if needed
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';  // ← if using tanstack query

import ${componentName} from '${importPath}';

const queryClient = /* new QueryClient() */ null; // uncomment if using react-query

// Optional: wrap with providers your app normally uses
const AllProviders = ({ children }) => (
  <BrowserRouter>
    {/* <AuthProvider> */}
      {/* <QueryClientProvider client={queryClient}> */}
        {children}
      {/* </QueryClientProvider> */}
    {/* </AuthProvider> */}
  </BrowserRouter>
);

test('${componentName} renders without crashing', () => {
  render(<${componentName} />, { wrapper: AllProviders });
  expect(screen.getByTestId?.('root') || document.body).toBeInTheDocument();
  // Tip: add data-testid="root" to the outermost element if possible
});

test('${componentName} shows meaningful content', () => {
  render(<${componentName} />, { wrapper: AllProviders });

  // At least one of these should exist in a real component
  const hasText     = screen.queryByText(/./i) !== null;
  const hasHeading  = screen.queryByRole('heading') !== null;
  const hasButton   = screen.queryByRole('button') !== null;
  const hasLink     = screen.queryByRole('link') !== null;

  expect(
    hasText || hasHeading || hasButton || hasLink,
    "Component should render some meaningful text, heading, button or link"
  ).toBe(true);
});

test('${componentName} matches snapshot', () => {
  const { container } = render(<${componentName} />, { wrapper: AllProviders });
  expect(container).toMatchSnapshot();
});

// Add more specific tests here, examples:
// test('calls onClick when button is clicked', async () => { ... });
// test('shows error message when prop error=true', () => { ... });
// test('navigates when link is clicked', async () => { ... });
`;
}

// ────────────────────────────────────────────────
function generateTestFile(filePath) {
  const parsed = path.parse(filePath);
  const componentName = parsed.name;

  const testFolder = path.join(TEST_DIR, path.relative(SRC_DIR, parsed.dir));
  const testFilePath = path.join(testFolder, `${componentName}.test.tsx`);

  if (fs.existsSync(testFilePath)) {
    return { status: 'already-exists', path: testFilePath };
  }

  fs.mkdirSync(testFolder, { recursive: true });

  const importPath = getImportPath(filePath);
  const content = generateTestContent(componentName, importPath);

  fs.writeFileSync(testFilePath, content, 'utf-8');

  return { status: 'created', path: testFilePath };
}

// ────────────────────────────────────────────────
// Main
try {
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
    console.log(`Created directory: ${TEST_DIR}`);
  }

  const allComponents = findAllTsxFiles();

  console.log(`Found ${allComponents.length} .tsx files (excluding tests & skipped)`);

  let created = 0;
  let skipped = 0;

  allComponents.forEach((filePath, idx) => {
    const short = path.relative(process.cwd(), filePath);
    process.stdout.write(`  ${idx + 1}/${allComponents.length}  ${short} `);

    const result = generateTestFile(filePath);

    if (result.status === 'created') {
      console.log('→ created');
      created++;
    } else {
      console.log('→ already exists');
      skipped++;
    }
  });

  console.log('\n' + '═'.repeat(60));
  console.log(`Done!   Created: ${created}    Already existed: ${skipped}`);
  console.log('Next steps:');
  console.log('  1. npm run test');
  console.log('  2. Improve the generated tests (add props, userEvent, mocking)');
  console.log('  3. Consider adding MSW or react-query mocks for data-fetching components');
  console.log('═'.repeat(60) + '\n');

} catch (err) {
  console.error('Generation failed:');
  console.error(err);
  process.exit(1);
}