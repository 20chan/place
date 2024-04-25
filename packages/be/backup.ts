import dotenv from 'dotenv';
dotenv.config();

import { backup, dump } from './src/util';

const now = new Date();

async function backupData() {
  const path = `backups/backup-${now.toISOString()}.dat`;

  await backup(path);
  console.log(`Backup saved to ${path}`);
}

async function dumpImage() {
  const path = `backups/backup-${now.toISOString()}.bmp`;

  await dump(path);
  console.log(`Image saved to ${path}`);
}

async function main() {
  await backupData();
  await dumpImage();
}

main()
  .then(() => process.exit(0))
  .catch(console.error);