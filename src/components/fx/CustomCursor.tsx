'use client';

import { useEffect, useRef } from 'react';

/**
 * Decorative cursor follower. The native cursor stays visible; a teal dot
 * tracks it exactly while a ring trails behind with a spring. Interactive
 * elements grow the ring. Hidden on touch devices and for reduced motion
 * (see globals.css).
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let raf = 0;
    const pointer = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };

    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        'a, button, [role="button"], input, select, textarea, label, summary'
      );
      ring.classList.toggle('is-hover', Boolean(interactive));
    };

    const onDown = () => ring.classList.add('is-press');
    const onUp = () => ring.classList.remove('is-press');

    const tick = () => {
      ringPos.x += (pointer.x - ringPos.x) * 0.16;
      ringPos.y += (pointer.y - ringPos.y) * 0.16;
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
