import { redis } from './redis';

export const WIDTH = 1000;
export const HEIGHT = 1000;

const boardKey = 'board:u1';

function getOffset(x: number, y: number): number {
  return x + y * WIDTH;
}

export async function init() {
  if (!await exists()) {
    await create();
  }
}

async function exists() {
  return await redis.exists(boardKey);
}

async function create() {
  const bytes = WIDTH * HEIGHT;
  const buffer = Buffer.alloc(bytes, 0);

  await redis.set(boardKey, buffer);
}

export async function bitmap() {
  const buffer = await redis.getBuffer(boardKey);
  return buffer;
}

export async function set(x: number, y: number, c: number) {
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(c)) {
    throw new Error('Invalid input');
  }
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT || c < 0 || c > 31) {
    throw new Error('Invalid input');
  }

  const offset = getOffset(x, y);

  await redis.bitfield(boardKey, 'SET', 'u8', `#${offset}`, c);
}

export async function get(x: number, y: number) {
  const offset = getOffset(x, y);
  return await redis.bitfield(boardKey, 'GET', 'u8', `#${offset}`);
}