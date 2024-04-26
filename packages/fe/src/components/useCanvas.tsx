import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import panzoom, { PanZoom } from '@20chan/panzoom';

export function useCanvas({
  onClick,
  onDrag,
}: {
  onClick: (x: number, y: number) => void;
  onDrag: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [pz, setPz] = useState<PanZoom | null>(null);

  const [mousePos, setMousePos] = useState([0, 0]);
  const mousePosRef = useRef(mousePos);

  const mouseDownRef = useRef(false);

  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    setPz(panzoom(ref.current, {
      maxZoom: 40,
      minZoom: 0.1,
      smoothScroll: false,
      onDoubleClick: () => { return false; },
      onTouch: () => { return false; },
    }));

    const context = ref.current.getContext('2d');
    if (context) {
      context.imageSmoothingEnabled = false;
      (context as any).mozImageSmoothingEnabled = false;
      (context as any).webkitImageSmoothingEnabled = false;

      setCtx(context);
    }
  }, [ref.current]);

  const clickHandler = useCallback((e: MouseEvent) => {
    if (!ctx || !pz) {
      return;
    }
    const transform = pz.getTransform();

    const x = Math.floor((e.clientX - transform.x) / transform.scale);
    const y = Math.floor((e.clientY - transform.y) / transform.scale);

    onClick(x, y);
  }, [pz, onClick]);

  const dragHandler = useCallback((e: MouseEvent) => {
    if (!ctx || !pz || !mouseDownRef.current) {
      return;
    }
    if (process.env.NEXT_PUBLIC_ALLOW_DRAG !== 'true') {
      return;
    }

    const transform = pz.getTransform();

    const x = Math.floor((e.clientX - transform.x) / transform.scale);
    const y = Math.floor((e.clientY - transform.y) / transform.scale);

    onClick(x, y);
  }, [pz, onClick]);

  const mousedownHandler = (e: MouseEvent) => {
    if (e.button === 0) {
      mouseDownRef.current = true;
    }
  };

  const mouseupHandler = () => {
    mouseDownRef.current = false;
  }

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.onclick = clickHandler;
    ref.current.addEventListener('mousedown', mousedownHandler);
    ref.current.addEventListener('mouseup', mouseupHandler);
    ref.current.addEventListener('mousemove', dragHandler);

    return () => {
      if (ref.current) {
        ref.current.onclick = null;
        ref.current.removeEventListener('mousedown', mousedownHandler);
        ref.current.removeEventListener('mouseup', mouseupHandler);
        ref.current.removeEventListener('mousemove', dragHandler);
      }
    };
  }, [ref.current, clickHandler]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.oncontextmenu = e => {
      e.preventDefault();
    }

    return () => {
      if (ref.current) {
        ref.current.oncontextmenu = null;
      }
    };
  }, [ref.current]);

  return {
    ref,
    ctx,
    pz,
  };
}