const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We are going to replace alert(msg) with showAlert(msg)
  // and confirm(msg) with await showConfirm(msg)

  // Use a regex that catches alert(...) and confirm(...)
  // Ensuring we don't catch something like "somealert()" or "confirm(" inside a string
  // It's a bit naive, but it works for this project.

  let modified = false;

  // Replace confirm(...) with await showConfirm(...)
  // We use word boundary to ensure it's exactly confirm
  const confirmRegex = /\bconfirm\((.*?)\)/g;
  if (confirmRegex.test(content)) {
    content = content.replace(confirmRegex, "await showConfirm($1)");
    modified = true;
  }

  // Replace alert(...) with showAlert(...)
  const alertRegex = /\balert\((.*?)\)/g;
  if (alertRegex.test(content)) {
    content = content.replace(alertRegex, "showAlert($1)");
    modified = true;
  }

  if (modified) {
    // Add import statement at the top
    const importStatement = `import { showAlert, showConfirm } from '@/lib/custom-alerts';\n`;
    if (!content.includes('custom-alerts')) {
      // Find the last import line or just put it after 'use client'
      if (content.includes("'use client';")) {
        content = content.replace("'use client';", "'use client';\n" + importStatement);
      } else {
        content = importStatement + content;
      }
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Modified: ${filePath}`);
  }
}

walk('./src', processFile);
console.log('Done replacing alerts and confirms.');
