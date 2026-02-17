import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================');
console.log('  Fixing all test issues  ');
console.log('====================================\n');

const TEST_DIR = 'src/test';

// Apply specific fixes to known problematic files
console.log('Applying specific fixes to known failing tests...\n');

const specificFixes = [
  {
    pattern: 'src/test/components/ProtectedRoute.test.tsx',
    fix: (content) => {
      // Fix import statements
      return content
        .replace(/import \{ describe, it, expect,  \} from \.vitest\.;/g, 'import { describe, it, expect, vi } from \'vitest\';')
        .replace(/import \{ describe, it, expect \} from \'\.\/test-utils\'/g, 'import { describe, it, expect, vi } from \'vitest\';\nimport { renderWithProviders } from \'../test-utils\'');
    }
  },
  {
    pattern: 'src/test/contexts/AuthContext.test.tsx',
    fix: (content) => {
      return content
        .replace(/import \{ describe, it, expect,  \} from \.vitest\.;/g, 'import { describe, it, expect, vi } from \'vitest\';')
        .replace(/import \{ renderWithProviders, useMockAuth \} from \'\.\.\/\.\.\/test-utils\'/g, 'import { renderWithProviders } from \'../test-utils\'');
    }
  }
];

specificFixes.forEach(({ pattern, fix }) => {
  const fullPath = path.join(process.cwd(), pattern);
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf-8');
      const newContent = fix(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf-8');
        console.log(`✅ Fixed: ${pattern}`);
      } else {
        console.log(`⏭️ No changes needed: ${pattern}`);
      }
    } catch (err) {
      console.log(`❌ Error fixing ${pattern}: ${err.message}`);
    }
  } else {
    console.log(`⚠️ Not found: ${pattern}`);
  }
});

console.log('\nFixed specific test files\n');

// Fix import paths for all test files
console.log('Fixing import paths for all test files...\n');

function findAllTestFiles(dir = TEST_DIR) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(findAllTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.test.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const testFiles = findAllTestFiles();
console.log(`Found ${testFiles.length} test files\n`);

let fixed = 0;
let unchanged = 0;

testFiles.forEach((filePath, idx) => {
  const short = path.relative(process.cwd(), filePath);
  process.stdout.write(`  ${idx + 1}/${testFiles.length}  ${short} `);

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;
    
    // Fix import statements
    content = content
      // Fix broken vitest imports
      .replace(/import \{ describe, it, expect,  \} from \.vitest\.;/g, 'import { describe, it, expect, vi } from \'vitest\';')
      .replace(/import \{ describe, it, expect \} from \'\.\/test-utils\'/g, 'import { describe, it, expect, vi } from \'vitest\';\nimport { renderWithProviders } from \'./test-utils\'')
      .replace(/import \{ describe, it, expect \} from \'\.\.\/test-utils\'/g, 'import { describe, it, expect, vi } from \'vitest\';\nimport { renderWithProviders } from \'../test-utils\'')
      .replace(/import \{ describe, it, expect \} from \'\.\.\/\.\.\/test-utils\'/g, 'import { describe, it, expect, vi } from \'vitest\';\nimport { renderWithProviders } from \'../../test-utils\'')
      
      // Fix empty arrow functions
      .replace(/\(\) => \}/g, '() => {}')
      .replace(/\(\) => ,/g, '() => {},')
      
      // Fix hyphenated imports
      .replace(/import test-utils from/g, 'import * as testUtils from')
      
      // Fix any other malformed imports
      .replace(/from \'@\//g, 'from \'@/')
      .replace(/from \"@\//g, 'from "@/');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log('✓ fixed');
      fixed++;
    } else {
      console.log('⏭️ no changes');
      unchanged++;
    }
  } catch (err) {
    console.log('❌ error');
    console.error(`  Error: ${err.message}`);
  }
});

// Also fix test-utils.test.tsx specifically
const testUtilsTestPath = path.join(TEST_DIR, 'test-utils.test.tsx');
if (fs.existsSync(testUtilsTestPath)) {
  try {
    let content = fs.readFileSync(testUtilsTestPath, 'utf-8');
    let originalContent = content;
    
    content = content
      .replace(/import test-utils from/g, 'import * as testUtils from')
      .replace(/import \{ describe, it, expect,  \} from \.vitest\.;/g, 'import { describe, it, expect, vi } from \'vitest\';');
    
    if (content !== originalContent) {
      fs.writeFileSync(testUtilsTestPath, content, 'utf-8');
      console.log(`\n✅ Fixed: test-utils.test.tsx`);
    }
  } catch (err) {
    console.log(`\n❌ Error fixing test-utils.test.tsx: ${err.message}`);
  }
}

console.log('\n' + '═'.repeat(50));
console.log(`✅ Fixed: ${fixed} files`);
console.log(`⏭️ Unchanged: ${unchanged} files`);
console.log('═'.repeat(50));

console.log('\n✨ All fixes applied! Run: npm test\n');