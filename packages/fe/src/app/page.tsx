'use client';

import { useSocket } from '@/components/socket';
import { Colors } from '@/lib/colors';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Palette } from './Palette';
import { SERVER_URL } from '@/lib/consts';
import { useCanvas } from '@/components/useCanvas';

export default function Home() {
  const { socket } = useSocket();

  const [color, setColor] = useState(0);

  const {
    ref,
    ctx,
  } = useCanvas({
    onClick: useCallback((x, y) => {
      draw([x, y, color]);
      requestDraw(x, y, color);
    }, [color]),
  });

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on('draw', (data) => {
      draw(data);
    });

    return () => {
      socket.off('draw');
    };
  }, [socket]);

  useEffect(() => {
    if (!ref.current || !ctx) {
      return;
    }

    fetch(`${SERVER_URL}/api/map`).then(async res => {
      const data = await res.json() as {
        width: number;
        height: number;
        coords: [number, number, number][];
      };

      ref.current!.width = data.width;
      ref.current!.height = data.height;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, data.width, data.height);
      data.coords.forEach((xs: [number, number, number]) => {
        draw(xs);
      });
    });
  }, [ref, ctx]);

  function requestDraw(x: number, y: number, c: number) {
    fetch(`${SERVER_URL}/api/draw`, {
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

  const draw = useCallback((xs: [number, number, number]) => {
    if (!ctx) {
      console.log('no ctx');
      return;
    }
    const [x, y, c] = xs;
    ctx.fillStyle = Colors[c];
    ctx.fillRect(x, y, 1, 1);
  }, [ctx]);

  return (
    <div>
      <canvas
        ref={ref}
        style={{
          imageRendering: 'pixelated',
        }}
      />

      <div className='fixed z-10 left-1/2 -translate-x-1/2 bottom-2'>
        <Palette color={color} setColor={setColor} />
      </div>
    </div>
  );
}
