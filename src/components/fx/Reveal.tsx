'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 64 },
  down: { x: 0, y: -64 },
  left: { x: 72, y: 0 },
  right: { x: -72, y: 0 },
};

/**
 * Slide-in entrance. Content stays fully opaque the whole way — it travels
 * from an offset into place instead of fading, so sections read as panels
 * sliding over each other rather than dissolving in.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance,
  once = true,
  amount = 0.1,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  /** Travel distance in px. Defaults to 64px vertically, 72px horizontally. */
  distance?: number;
  once?: boolean;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const base = offsets[direction];
  const travel = distance ?? (direction === 'up' || direction === 'down' ? 64 : 72);

  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : { x: base.x ? Math.sign(base.x) * travel : 0, y: base.y ? Math.sign(base.y) * travel : 0 }}
      whileInView={reduce ? undefined : { x: 0, y: 0 }}
      viewport={{ once, amount, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}