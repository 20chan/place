import { useEffect, useRef, useState } from 'react';

export function useCanvas({
  onClick,
}: {
  onClick: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const [offset, setOffset] = useState([0, 0]);
  const [zoom, setZoom] = useState(20);

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

    ref.current.onclick = e => {
      const x = Math.floor((e.clientX - offset[0]) / zoom);
      const y = Math.floor((e.clientY - offset[1]) / zoom);

      onClick(x, y);
    };

    return () => {
      ref.current!.onclick = null;
    };
  }, [ref.current, offset, zoom, onClick]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.oncontextmenu = e => {
      e.preventDefault();
    }

    return () => {
      ref.current!.oncontextmenu = null;
    };
  }, [ref.current]);

  return {
    ref,
    ctx,
  };
}