const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'public', 'images', 'brands');
const brands = ['valeo','skf','ngk','mann-filter','febi-bilstein','trw','denso','hella','ate','continental'];
brands.forEach(b => {
  const label = b.toUpperCase().replace('-', ' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120"><rect width="400" height="120" fill="#ffffff"/><text x="200" y="60" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="600" text-anchor="middle" dominant-baseline="middle" fill="#111111">${label}</text></svg>`;
  fs.writeFileSync(path.join(dir, b + '.svg'), svg);
});
console.log('done');
