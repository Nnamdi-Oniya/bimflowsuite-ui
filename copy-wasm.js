// copy-wasm.js
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const srcDir = path.join(__dirname, 'node_modules', 'web-ifc');
const destDir = path.join(__dirname, 'public');

(async () => {
  try {
    const files = await glob('*.wasm', { cwd: srcDir });

    if (files.length === 0) {
      console.log('No .wasm files found in node_modules/web-ifc');
      return;
    }

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    for (const file of files) {
      const src = path.join(srcDir, file);
      const dest = path.join(destDir, file);
      fs.copyFileSync(src, dest);
      console.log(`Copied: ${file} → public/`);
    }

    console.log('All .wasm files copied successfully.');
  } catch (err) {
    console.error('Error copying .wasm files:', err);
    process.exit(1);
  }
})();