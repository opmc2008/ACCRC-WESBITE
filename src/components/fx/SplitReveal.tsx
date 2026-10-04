'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Editorial line-by-line reveal. Pass each visual line of the heading as a
 * child string or node; every line rises out of an overflow mask in a
 * staggered sequence when scrolled into view.
 *
 * The `whileInView` trigger lives on the untransformed mask, not on the
 * translated line: an element pushed below its own `overflow: hidden` mask has
 * a zero visible intersection ratio, so observing it directly would deadlock.
 */
export function SplitReveal({
  lines,
  className = '',
  lineClassName = '',
  delay = 0,
  stagger = 0.12,
  as: Tag = 'h2',
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <motion.span
          className="split-line-mask"
          key={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2, margin: '0px 0px -10% 0px' }}
          variants={{ visible: { transition: { delayChildren: delay + i * stagger } } }}
        >
          <motion.span
            className={`block ${lineClassName}`}
            variants={{
              hidden: { y: '110%', rotate: 2.5 },
              visible: {
                y: '0%',
                rotate: 0,
                transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {line}
          </motion.span>
        </motion.span>
      ))}
    </Tag>
  );
}
