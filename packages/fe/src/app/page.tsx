'use client';

import rgbHex from 'rgb-hex';
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
  const [size, setSize] = useState(1);

  const drawHandler = useCallback((x: number, y: number) => {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (getColorAt(x + i, y + j) === color) {
          continue;
        }

        draw([x + i, y + j, color]);
        requestDraw(x + i, y + j, color);
      }
    }
    draw([x, y, color]);
    requestDraw(x, y, color);
  }, [size, color]);

  const {
    ref,
    ctx,
    pz,
  } = useCanvas({
    onClick: drawHandler,
    onDrag: drawHandler,
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
        const imageData = ctx.createImageData(data.width, data.height);

        const buffer = await res.arrayBuffer();
        const u8 = new Uint8Array(buffer);

        for (let y = 0; y < data.height; y++) {
          for (let x = 0; x < data.width; x++) {
            const index = x + y * data.width;
            const c = u8[index];
            const r = parseInt(Colors[c].slice(1, 3), 16);
            const g = parseInt(Colors[c].slice(3, 5), 16);
            const b = parseInt(Colors[c].slice(5, 7), 16);

            const i = (x + y * data.width) * 4;
            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);
      });
    });
  }, [ref, ctx, pz]);

  const getColorAt = useCallback((x: number, y: number) => {
    if (!ctx) {
      return;
    }
    const data = ctx.getImageData(x, y, 1, 1).data;
    const colorHex = `#${rgbHex(data[0], data[1], data[2])}`;

    const c = Object.values(Colors).indexOf(colorHex as any);
    return c;
  }, [ctx]);

  const handleWheelClick = useCallback((e: MouseEvent) => {
    if (e.button !== 1 || !pz || !ctx) {
      return;
    }

    const transform = pz.getTransform();

    const x = Math.floor((e.clientX - transform.x) / transform.scale);
    const y = Math.floor((e.clientY - transform.y) / transform.scale);

    const c = getColorAt(x, y)!;

    setColor(c);
  }, [pz, ctx, getColorAt]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.addEventListener('mousedown', handleWheelClick);

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('mousedown', handleWheelClick);
      }
    }
  }, [handleWheelClick]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (process.env.NEXT_PUBLIC_ALLOW_DRAG !== 'true') {
      return;
    }

    if (e.key === '[') {
      setSize(x => Math.max(1, x - 1));
    } else if (e.key === ']') {
      setSize(x => x + 1);
    }
  }, [setSize]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

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

        <CursorOverlay pz={pz} canvasRef={ref} color={color} size={size} />
      </div>

      <div className='fixed z-10 left-1/2 -translate-x-1/2 bottom-2'>
        <Palette color={color} setColor={setColor} />
      </div>
    </div>
  );
}
