const sharp = require('sharp');
const fs = require('fs');

async function buildLogos() {
  const input = 'logo.png';
  
  if (!fs.existsSync(input)) {
    console.error('logo.png not found in root.');
    return;
  }

  // 1. Mobile App Icon (1024x1024) - White background
  await sharp(input)
    .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }) // padding
    .extend({ top: 112, bottom: 112, left: 112, right: 112, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFile('mobile/assets/icon.png');
  console.log('✔ mobile/assets/icon.png created.');

  // 2. Mobile Adaptive Icon (1080x1080) - Transparent padding (Android will apply white background via app.json)
  await sharp(input)
    .resize(750, 750, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({ top: 165, bottom: 165, left: 165, right: 165, background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile('mobile/assets/adaptive-icon.png');
  console.log('✔ mobile/assets/adaptive-icon.png created.');

  // 3. Mobile Splash Screen (1242x2436) - White background
  await sharp(input)
    .resize(900, 900, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({ top: 768, bottom: 768, left: 171, right: 171, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFile('mobile/assets/splash.png');
  console.log('✔ mobile/assets/splash.png created.');

  // 4. Admin Navigation Logo
  // Assuming trim() automatically crops empty white/transparent space
  await sharp(input)
    .trim({ threshold: +10 }) // removing empty white/transparent borders
    .resize({ height: 120, withoutEnlargement: true }) // nice size For vite navbar
    .toFile('admin/src/assets/logo.png');
  console.log('✔ admin/src/assets/logo.png created.');

  // 5. Admin Favicon (512x512)
  await sharp(input)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toFile('admin/public/favicon.png');
  console.log('✔ admin/public/favicon.png created.');

  console.log('All icons compiled perfectly!');
}

buildLogos().catch(console.error);
