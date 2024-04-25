'use client';

import { useSocket } from '@/components/socket';
import { Colors } from '@/lib/colors';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Palette } from './Palette';
import { SERVER_URL } from '@/lib/consts';
import { useCanvas } from '@/components/useCanvas';
import { CursorOverlay } from '@/components/CursorOverlay';

export default function Home() {
  const { socket } = useSocket();

  const [color, setColor] = useState(0);

  const {
    ref,
    ctx,
    pz,
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
    if (!ref.current || !ctx || !pz) {
      return;
    }

    fetch(`${SERVER_URL}/api/info`).then(async res => {
      const data = await res.json() as {
        width: number;
        height: number;
      };

      ref.current!.width = data.width;
      ref.current!.height = data.height;

      pz.moveTo(data.width / 2, 0);

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, data.width, data.height);

      await fetch(`${SERVER_URL}/api/bitmap`).then(async res => {
        const buffer = await res.arrayBuffer();
        const u8 = new Uint8Array(buffer);

        for (let y = 0; y < data.height; y++) {
          for (let x = 0; x < data.width; x++) {
            const index = Math.floor((x + y * data.width) / 2);
            const value = u8[index];
            const isUpper = (x + y * data.width) % 2 === 0;
            const c = (
              isUpper
                ? (value & 0xf0) >> 4
                : value & 0x0f
            )

            if (c !== 0) {
              draw([x, y, c]);
            }
          }
        }
      });
    });
  }, [ref, ctx, pz]);

  useEffect(() => {
    const handleContextmenu = (e: any) => {
      e.preventDefault()
    }
    document.addEventListener('contextmenu', handleContextmenu)
    return function cleanup() {
      document.removeEventListener('contextmenu', handleContextmenu)
    }
  }, [])

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
    <div className='w-screen h-screen'>
      <div className='relative'>
        <canvas
          ref={ref}
          style={{
            imageRendering: 'pixelated',
            touchAction: 'manipulation',
          }}
        />

        <CursorOverlay pz={pz} canvasRef={ref} color={color} />
      </div>

      <div className='fixed z-10 left-1/2 -translate-x-1/2 bottom-2'>
        <Palette color={color} setColor={setColor} />
      </div>
    </div>
  );
}
