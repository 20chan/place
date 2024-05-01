import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { readFile } from 'fs/promises';
import { createServer } from 'http';
import { createSocket } from './socket';
import { redis } from './redis';
import * as board from './board';
import { convertBackupName, loadBackupBitmap, loadBackups, parseBackupName } from './util';

const app = express();
const server = createServer(app);
const io = createSocket(server);

app.use(cors());
app.use(express.json());

const router = express.Router();

router.get('/info', async (req, res) => {
  const conn = await redis.get('conn');
  res.json({
    width: board.WIDTH,
    height: board.HEIGHT,
    conn,
  });
});

router.get('/bitmap', async (req, res) => {
  const buffer = await board.bitmap();
  res.write(buffer, 'binary', () => res.end(null, 'binary'));
});

router.post('/draw', async (req, res) => {
  const { x, y, c } = req.body;
  try {
    await board.set(x, y, c);
    io.emit('draw', [x, y, c]);
    res.json({ ok: true });
  } catch {
    res.status(400).send('Invalid input');
  }
});

router.get('/history', async (req, res) => {
  const backups = await loadBackups('backups/u1/');

  res.json(backups.map(parseBackupName).map(x => x?.getTime()));
});

router.get('/history/:ts', async (req, res) => {
  const { ts } = req.params;

  const name = `${convertBackupName(new Date(Number(ts)))}.png`;
  const buffer = await readFile(path.join('backups/u1', name));

  res.contentType('image/png');
  res.write(buffer, 'binary', () => res.end(null, 'binary'));
});

app.use('/api', router);

io.on('connection', async (socket) => {
  const cnt = await redis.incr('conn');
  io.emit('count', cnt);

  socket.on('disconnect', async () => {
    const cnt = await redis.decr('conn');
    io.emit('count', cnt);
  });
});

async function main() {
  await board.init();
  await redis.set('conn', 0);

  const PORT = process.env.PORT ?? 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main()
  .catch(console.error);