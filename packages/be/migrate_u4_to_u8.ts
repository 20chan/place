import dotenv from 'dotenv';
dotenv.config();

import { HEIGHT, WIDTH } from './src/board';
import { redis } from './src/redis';

async function main() {
  const srcKey = 'board:u0';
  const dstKey = 'board:u1';

  const bitmap = await redis.getBuffer(srcKey);
  const srcArray = new Uint8Array(bitmap!);

  const bytes = Math.ceil(WIDTH * HEIGHT);
  const buffer = Buffer.alloc(bytes, 0);
  const destArray = new Uint8Array(buffer);

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const index = Math.floor((x + y * WIDTH) / 2);
      const value = srcArray[index];
      const isUpper = (x + y * WIDTH) % 2 === 0;
      const c = (
        isUpper
          ? (value & 0xf0) >> 4
          : value & 0x0f
      );

      const offset = x + y * WIDTH;
      destArray[offset] = c;
    }
  }

  await redis.set(dstKey, Buffer.from(destArray));
}

main().then(() => process.exit())