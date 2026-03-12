const sharp = require('sharp');
const sizes = [192, 512];
for (const size of sizes) {
  const r = Math.round(size * 0.15);
  const fs2 = Math.round(size * 0.38);
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg"',
    ' width="' + size + '" height="' + size + '"',
    ' viewBox="0 0 ' + size + ' ' + size + '">',
    '<rect width="' + size + '" height="' + size + '" rx="' + r + '" fill="#0ea5e9"/>',
    '<text x="50%" y="54%" font-family="monospace" font-size="' + fs2 + '"',
    ' font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">',
    '&lt;/&gt;</text></svg>'
  ].join('');
  sharp(Buffer.from(svg)).png().toFile('public/icons/pwa-' + size + 'x' + size + '.png', function(err) {
    if (err) console.error(err);
    else console.log('Created pwa-' + size + 'x' + size + '.png');
  });
}
