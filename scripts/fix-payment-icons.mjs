import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'client', 'public', 'payment-icons');
const files = ['mir.jpg', 'sbp.jpg', 'yookassa.jpg'];
const threshold = 48;

for (const file of files) {
  const input = join(root, file);
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= threshold && g <= threshold && b <= threshold) {
      data[i + 3] = 0;
    }
  }

  const out = join(root, file.replace('.jpg', '.png'));
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(out);
  console.log('OK', out);
}
