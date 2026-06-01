const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let newContent = content.replace(/\{errors\.([a-zA-Z0-9_]+)(\?)?\.message\}/g, '{errors.$1$2.message as string}');
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Fixed errors message types!');
