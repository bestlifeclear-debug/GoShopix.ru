/**
 * Показать OTP-код для входа (когда SMTP не настроен).
 * Usage: node scripts/get-otp-code.mjs customer@goshopix.ru
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const identifier = process.argv[2] ?? 'customer@goshopix.ru';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

await import('../server/dist/load-env.js');
const { sendLoginOtp } = await import('../server/dist/services/passwordlessAuth.js');
const { parseIdentifier } = await import('../server/dist/lib/identifier.js');

const parsed = parseIdentifier(identifier);
const res = await sendLoginOtp(identifier, parsed);
console.log('\nКонтакт:', res.maskedDestination);
console.log('Код для входа:', res.devCode ?? '(не отдан — включите EXPOSE_OTP_DEV_CODE или отключите production)');
console.log('Действует 5 минут.\n');
