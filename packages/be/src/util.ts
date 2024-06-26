import { writeFile, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { createCanvas } from 'canvas';
import * as board from './board';

export const Colors = [
  '#ffffff',
  '#000000',
  '#ff4500',
  '#ffa800',
  '#ffd635',
  '#00a368',
  '#7eed56',
  '#2450a4',
  '#3690ea',
  '#51e9f4',
  '#811e9f',
  '#b44ac0',
  '#ff99aa',
  '#9c6926',
  '#898d90',
  '#d4d7c9',

  '#9fe2bf',
  '#444444',
  '#f14382',
  '#f9cb9c',
  '#f7dc6f',
  '#006600',
  '#33d2b2',
  '#153062',
  '#91a7d1',
  '#cfe2f3',
  '#d09aff',
  '#f3a6ff',
  '#ffece1',
  '#d5a99e',
  '#753823',
  '#402811',
] as const;

export function parseBackupName(name: string) {
  const match = name.match(/backup-(.+)\.dat/);
  if (!match) {
    return null;
  }

  const parsed = match[1].match(/(\d{4}-\d{2}-\d{2})T(\d{2}-\d{2}-\d{2})-(\d{3}Z)/);
  if (!parsed) {
    return null;
  }

  const left = parsed[1];
  const middle = parsed[2].replace(/-/g, ':');
  const right = parsed[3];

  const iso = `${left}T${middle}.${right}`;

  return new Date(iso);
}

export function convertBackupName(ts: Date) {
  return `backup-${ts.toISOString().replace(/:/g, '-').replace(/\./g, '-')}`;
}

export async function loadBackups(path: string) {
  const files = await readdir(path);
  const backups = files.filter(x => x.endsWith('.dat')).sort();

  return backups;
}

export async function loadLastBackup(path: string) {
  const backups = await loadBackups(path);
  return await readFile(join(path, backups[backups.length - 1]));
}

export async function loadBackupBitmap(path: string) {
  return await readFile(path);
}

export async function backup(path: string) {
  const bitmap = await board.bitmap();
  if (!bitmap) {
    return;
  }

  await writeFile(path, bitmap);
}

export async function dump(path: string) {
  const canvas = createCanvas(board.WIDTH, board.HEIGHT);

  const ctx = canvas.getContext('2d');
  const bitmap = await board.bitmap();
  if (!bitmap) {
    return;
  }

  const u8 = new Uint8Array(bitmap);

  const imageData = ctx.createImageData(board.WIDTH, board.HEIGHT);
  for (let y = 0; y < board.HEIGHT; y++) {
    for (let x = 0; x < board.WIDTH; x++) {
      const index = x + y * board.WIDTH;
      const c = u8[index];

      const r = parseInt(Colors[c].slice(1, 3), 16);
      const g = parseInt(Colors[c].slice(3, 5), 16);
      const b = parseInt(Colors[c].slice(5, 7), 16);

      const i = (x + y * board.WIDTH) * 4;
      imageData.data[i] = r;
      imageData.data[i + 1] = g;
      imageData.data[i + 2] = b;
      imageData.data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const buffer = canvas.toBuffer();
  await writeFile(path, buffer);
}