
import fs from 'fs';

const filePath = 'src/constants.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Remove leading slash from /brand_
content = content.replace(/'\/brand_/g, "'brand_");

fs.writeFileSync(filePath, content);
console.log('done');
