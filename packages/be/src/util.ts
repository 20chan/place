import { writeFile, readFile } from 'fs/promises';
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
] as const;

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
      const index = Math.floor((x + y * board.WIDTH) / 2);
      const value = u8[index];
      const isUpper = (x + y * board.WIDTH) % 2 === 0;
      const c = (
        isUpper
          ? (value & 0xf0) >> 4
          : value & 0x0f
      );

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