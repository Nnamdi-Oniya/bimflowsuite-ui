const fs = require('fs');
const path = require('path');

console.log('🚀 Generating tests for ALL .tsx files...\n');

// Create test directory
if (!fs.existsSync('src/test')) {
  fs.mkdirSync('src/test', { recursive: true });
  console.log('📁 Created: src/test/');
}

// Find all .tsx files
function findTsxFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    // Skip node_modules and test folders
    if (stat.isDirectory() && 
        !item.includes('node_modules') && 
        !item.includes('test') && 
        !item.includes('__')) {
      files = files.concat(findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx') && 
               !item.includes('.test.') && 
               !item.includes('.spec.')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Generate test for a file
function generateTest(filePath) {
  const fileName = path.basename(filePath, '.tsx');
  const relativePath = path.relative('src', path.dirname(filePath));
  
  // Create test file path
  const testDir = path.join('src/test', relativePath);
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const testFile = path.join(testDir, `${fileName}.test.tsx`);
  
  // Skip if test already exists
  if (fs.existsSync(testFile)) {
    return { file: fileName, status: 'skipped' };
  }
  
  // Generate test content
  const importPath = relativePath ? `../${relativePath}/${fileName}` : `./${fileName}`;
  
  const testContent = `import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ${fileName} from '${importPath}';

test('${fileName} renders', () => {
  const { container } = render(<${fileName} />);
  expect(container).toBeInTheDocument();
});

test('${fileName} has accessible content', () => {
  render(<${fileName} />);
  const elements = screen.getAllByRole('button', 'link', 'textbox', { hidden: true });
  expect(elements.length > 0 || screen.getByText(/./)).toBeTruthy();
});

test('${fileName} matches snapshot', () => {
  const { container } = render(<${fileName} />);
  expect(container).toMatchSnapshot();
});
`;
  
  fs.writeFileSync(testFile, testContent);
  return { file: fileName, status: 'created', path: testFile };
}

// Main execution
try {
  console.log('🔍 Scanning src directory...');
  const tsxFiles = findTsxFiles('src');
  
  console.log(`📊 Found ${tsxFiles.length} .tsx files\n`);
  
  const results = {
    created: 0,
    skipped: 0
  };
  
  // Process each file
  tsxFiles.forEach((file, index) => {
    console.log(`⏳ ${index + 1}/${tsxFiles.length}: ${path.basename(file, '.tsx')}`);
    
    const result = generateTest(file);
    
    if (result.status === 'created') {
      results.created++;
      console.log(`  ✅ Created: ${result.path}`);
    } else {
      results.skipped++;
      console.log(`  ⏭️  Skipped: Test already exists`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🎉 GENERATION COMPLETE!');
  console.log('='.repeat(50));
  console.log(`✅ Created: ${results.created} new test files`);
  console.log(`⏭️  Skipped: ${results.skipped} (already existed)`);
  console.log(`📁 Location: src/test/`);
  console.log('\n🚀 Run tests: npm test');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}