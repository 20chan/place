import dotenv from 'dotenv';
dotenv.config();

import { backup, dump, loadLastBackup } from './src/util';
import { bitmap } from './src/board';

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
  console.log(now.toISOString());
  const lastBackup = await loadLastBackup('backups/');
  const current = await bitmap();

  if (Buffer.compare(lastBackup, current!) === 0) {
    console.log('No changes detected');
    return;
  }

  await backupData();
  await dumpImage();
}

main()
  .then(() => process.exit(0))
  .catch(console.error);