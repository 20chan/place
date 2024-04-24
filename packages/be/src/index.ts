import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { createSocket } from './socket';

const app = express();
const server = createServer(app);
const io = createSocket(server);

app.use(cors());
app.use(express.json());

const router = express.Router();

const board = new Map<string, number>();
const width = 4000;
const height = 3000;

router.get('/map', (req, res) => {
  const coords = [...board].map(([key, value]) => [...key.split(',').map(Number), value]);

  res.json({
    width,
    height,
    coords,
  });
});

router.post('/draw', (req, res) => {
  const { x, y, c } = req.body;
  if (typeof x !== 'number' || typeof y !== 'number' || typeof c !== 'number') {
    return res.status(400).send('Invalid input');
  }
  if (x < 0 || x >= width || y < 0 || y >= height || c < 0 || c > 15 || !Number.isInteger(c)) {
    return res.status(400).send('Invalid input');
  }

  board.set(`${x},${y}`, c);
  io.emit('draw', [x, y, c]);

  return res.send('ok');
});

app.use('/api', router);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});