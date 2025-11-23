/**
 * Post-build script to flatten dist directory structure
 * TypeScript outputs to dist/backend/src/ with rootDir ".."
 * This script moves files to dist/ root to match package.json "main" entry
 */
const fs = require('fs');
const path = require('path');

const distRoot = path.join(__dirname, '..', 'dist');
const backendSrcPath = path.join(distRoot, 'backend', 'src');

// Function to recursively copy and delete
function moveFilesRecursive(source, destination) {
  if (!fs.existsSync(source)) {
    console.error(`Source path does not exist: ${source}`);
    return;
  }

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      moveFilesRecursive(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
      fs.unlinkSync(sourcePath);
    }
  });
}

// Move files from dist/backend/src/* to dist/*
if (fs.existsSync(backendSrcPath)) {
  console.log('Flattening dist directory...');
  moveFilesRecursive(backendSrcPath, distRoot);

  // Clean up empty directories
  const backendPath = path.join(distRoot, 'backend');
  const sharedPath = path.join(distRoot, 'shared');

  if (fs.existsSync(backendPath)) {
    fs.rmSync(backendPath, { recursive: true, force: true });
  }

  if (fs.existsSync(sharedPath)) {
    fs.rmSync(sharedPath, { recursive: true, force: true });
  }

  console.log('✓ dist directory flattened successfully');
} else {
  console.error(`Expected ${backendSrcPath} not found`);
  process.exit(1);
}
