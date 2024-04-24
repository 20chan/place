'use client';

import { useSocket } from '@/components/socket';
import { Colors } from '@/lib/colors';
import { useEffect, useRef, useState } from 'react';
import { TestDrawer } from './TestDrawer';

export default function Home() {
  const { socket } = useSocket();
  const ref = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on('draw', (data) => {
      console.log(data);
      draw(data);
    });

    return () => {
      socket.off('draw');
    };
  }, [socket]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.width = window.innerWidth;
    ref.current.height = window.innerHeight;

    const context = ref.current.getContext('2d');
    if (context) {
      setCtx(context);

      context.scale(20, 20);

      for (let i = 0; i < 10; i++) {
        draw([i, i, 0]);
      }
    }
  }, [ref.current]);

  function draw(xs: [number, number, number]) {
    if (ctx) {
      const [x, y, c] = xs;
      ctx.fillStyle = Colors[c];
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return (
    <div>
      <canvas ref={ref} />

      <div className='fixed z-10 right-0 top-0'>
        <TestDrawer />
      </div>
    </div>
  );
}
