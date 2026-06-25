const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/MadaDevelop/coffeexf1/src');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/@\/frontend\/components/g, '@/components')
    .replace(/@\/frontend\/context/g, '@/context')
    .replace(/@\/shared\/lib/g, '@/lib')
    .replace(/@\/shared\/data/g, '@/data');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
  }
});
console.log(`Updated ${count} files.`);
