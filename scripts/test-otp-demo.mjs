import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

await import('../server/dist/load-env.js');
const { sendLoginOtp, verifyLoginOtp } = await import('../server/dist/services/passwordlessAuth.js');
const { parseIdentifier } = await import('../server/dist/lib/identifier.js');

const email = 'customer@goshopix.ru';
const parsed = parseIdentifier(email);
const sent = await sendLoginOtp(email, parsed);
console.log('send:', sent);
const verified = await verifyLoginOtp(email, parsed, sent.devCode);
console.log('verify ok:', verified.user.email, 'token length:', verified.token.length);
