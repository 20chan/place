import { Colors } from '@/lib/colors';
import * as panzoom from '@20chan/panzoom';
import { useEffect, useMemo, useState } from 'react';

export function CursorOverlay({
  pz,
  canvasRef,
  color,
}: {
  pz: panzoom.PanZoom | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  color: number;
}) {
  if (!pz) {
    return null;
  }

  const [cursorPos, setCursorPos] = useState([0, 0]);
  const [cursorScale, setCursorScale] = useState(pz.getTransform().scale);

  const handleCursor = (e: MouseEvent) => {
    const t = pz.getTransform();

    const coord = [
      Math.floor((e.clientX - t.x) / t.scale),
      Math.floor((e.clientY - t.y) / t.scale),
    ];

    setCursorPos([
      coord[0] * t.scale + t.x,
      coord[1] * t.scale + t.y,
    ]);
  };

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleCursor);

    return () => {
      canvas.removeEventListener('mousemove', handleCursor);
    };
  }, [canvasRef.current]);

  const handleWheel = () => {
    setCursorScale(pz.getTransform().scale);
  };

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const owner = canvas.parentElement!;

    owner.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      owner.removeEventListener('wheel', handleWheel);
    };
  }, [canvasRef.current]);

  return (
    <div
      style={{
        position: 'absolute',
        backgroundColor: Colors[color],
        left: cursorPos[0],
        top: cursorPos[1],
        width: cursorScale,
        height: cursorScale,
        pointerEvents: 'none',
      }}
    />
  );
}