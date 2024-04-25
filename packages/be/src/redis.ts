import { Redis } from 'ioredis';

const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? '6379');
const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? '';

export const redis = new Redis({
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
})