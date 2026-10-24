import https from 'https';
import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'public', 'images', 'brands');

const brands = [
  { name: 'valeo', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Valeo_Logo.png/640px-Valeo_Logo.png' },
  { name: 'skf', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/SKF_logo.svg/512px-SKF_logo.svg.png' },
  { name: 'ngk', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/NGK_logo.svg/512px-NGK_logo.svg.png' },
  { name: 'mann-filter', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/MANN-FILTER_Logo.svg/512px-MANN-FILTER_Logo.svg.png' },
  { name: 'febi-bilstein', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Febi_Bilstein_Logo.svg/512px-Febi_Bilstein_Logo.svg.png' },
  { name: 'trw', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/TRW_logo.svg/512px-TRW_logo.svg.png' },
  { name: 'denso', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Denso_logo.svg/512px-Denso_logo.svg.png' },
  { name: 'hella', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Hella_logo.svg/512px-Hella_logo.svg.png' },
  { name: 'ate', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/ATE_Brakes_Logo.svg/512px-ATE_Brakes_Logo.svg.png' },
  { name: 'continental', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Continental_logo.svg/512px-Continental_logo.svg.png' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`${res.statusCode} for ${url}`));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function main() {
  for (const b of brands) {
    const ext = b.url.endsWith('.png') ? '.png' : '.png';
    const out = path.join(dir, `${b.name}.png`);
    try {
      await download(b.url, out);
      console.log('ok', b.name);
    } catch (e) {
      console.error('err', b.name, e.message);
    }
  }
}

main();
