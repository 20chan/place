'use client';

import { useSocket } from '@/components/socket';
import { Colors } from '@/lib/colors';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import { TestDrawer } from './TestDrawer';
import { Palette } from './Palette';

export default function Home() {
  const { socket } = useSocket();
  const ref = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const [color, setColor] = useState(0);
  const [offset, setOffset] = useState([0, 0]);
  const [zoom, setZoom] = useState(20);

  const clickHandler = useCallback((e: MouseEvent) => {
    const x = Math.floor((e.clientX - offset[0]) / zoom);
    const y = Math.floor((e.clientY - offset[1]) / zoom);

    console.log(color)
    requestDraw(x, y, color);
  }, [color]);

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
    }
  }, [ref.current]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.onclick = clickHandler;

    return () => {
      ref.current!.onclick = null;
    };
  }, [ref.current, clickHandler]);

  function requestDraw(x: number, y: number, c: number) {
    fetch('http://localhost:4200/api/draw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        x,
        y,
        c,
      }),
    });
  }

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

      <div className='fixed z-10 left-1/2 -translate-x-1/2 bottom-2'>
        <Palette color={color} setColor={setColor} />
      </div>
    </div>
  );
}
