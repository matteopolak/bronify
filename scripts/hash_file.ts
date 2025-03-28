import crypto from 'node:crypto';
import fs from 'node:fs';

const input = process.argv[2];

const hash = crypto.createHash('sha256');
const audio = fs.readFileSync(input);

hash.update(audio);

const id = hash.digest('base64url').slice(0, 8);

console.log(`Hash: ${id}\n\n`);
