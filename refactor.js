const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'src');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

let modifiedCount = 0;

walkDir(projectRoot, (filePath) => {
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace absolute imports using path alias @/
    content = content.replace(/@\/components\//g, '@/frontend/components/');
    content = content.replace(/@\/context\//g, '@/frontend/context/');
    content = content.replace(/@\/data\//g, '@/shared/data/');
    content = content.replace(/@\/lib\//g, '@/shared/lib/');

    // Handle relative imports too (e.g. ../../components/ or ./components/)
    // This is tricky but we can try to catch some common ones if they exist.
    // Given most Next.js projects use @/, hopefully this is enough. Let's do a simple replace just in case.
    // Note: Replacing generic "components/" might falsely match other things, so let's stick to @/ first.

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
        modifiedCount++;
    }
});

console.log(`Refactoring complete. Modified ${modifiedCount} files.`);
