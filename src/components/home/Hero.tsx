'use client';

import dynamic from 'next/dynamic';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronDown } from 'lucide-react';
import { Magnetic } from '@/components/fx/Magnetic';
import { SplitReveal } from '@/components/fx/SplitReveal';
import { ParticleCanvas } from '@/components/fx/ParticleCanvas';
import { StrokeRevealText } from '@/components/fx/StrokeRevealText';

/* WebGL scene is client-only; a gradient fallback sits underneath it. */
const RobotScene = dynamic(() => import('@/components/fx/RobotScene'), {
  ssr: false,
  loading: () => null,
});

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.25 } },
};
const item = {
  hidden: { y: 34 },
  visible: { y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export function Hero() {
  const reduceMotion = useReducedMotion();

  /* Depth-curtain scroll: the hero stays pinned behind the page while content
     slides over it (the sheet in page.tsx). Progress is measured in viewport
     heights so all the depth effects finish within the first screen of scroll —
     exactly while the sheet is sweeping over the hero. */
  const { scrollY } = useScroll();
  const depth = (from: number, to: number) => (reduceMotion ? from : to);

  const curtain = useTransform(scrollY, (y) =>
    Math.min(1, y / (typeof window === 'undefined' ? 800 : window.innerHeight)),
  );

  const contentY = useTransform(curtain, [0, 1], [0, depth(0, -80)]);
  const contentScale = useTransform(curtain, [0, 1], [1, depth(1, 0.86)]);
  const contentOpacity = useTransform(curtain, [0, 0.9], [1, depth(1, 0.15)]);
  const handY = useTransform(curtain, [0, 1], [0, depth(0, 110)]);
  const handScale = useTransform(curtain, [0, 1], [1, depth(1, 1.14)]);
  const handOpacity = useTransform(curtain, [0, 0.85], [1, depth(1, 0.3)]);
  const bgY = useTransform(curtain, [0, 1], [0, depth(0, 60)]);
  const cueOpacity = useTransform(curtain, [0, 0.2], [1, depth(1, 0)]);

  return (
    <section
      id="top"
      className="sticky top-0 z-0 flex min-h-[100svh] items-center overflow-hidden bg-primary pt-28 pb-24 sm:pt-32"
    >
      {/* ── Parallax backdrop layer (drifts down = deeper) ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-[1]" aria-hidden>
        <div className="absolute inset-0" aria-hidden>
          <ParticleCanvas
            className="absolute inset-0 w-full h-full"
            particleCount={70}
            particleColor="14, 138, 128"
            lineColor="43, 224, 210"
            maxLineDistance={140}
            mouseRadius={130}
          />
        </div>

        {/* Backdrop decorations */}
        <div className="dot-grid absolute inset-0 opacity-25 [mask-image:radial-gradient(70%_70%_at_60%_40%,black,transparent)]" aria-hidden />
        <div className="hero-3d-fallback" aria-hidden />

      {/* Organic blobs — enhanced with glow effects */}
      <motion.div
        className="absolute -left-24 top-1/4 z-[1] h-72 w-72 rounded-full bg-secondary/80 animate-float-slow"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />
      <motion.div
        className="absolute -right-16 bottom-16 z-[1] h-56 w-56 rounded-3xl bg-secondary/80 animate-float-slow [animation-delay:-4s]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />
      <motion.div
        className="absolute left-[38%] top-12 z-[1] h-24 w-24 rounded-full bg-glow/25 animate-float-slow [animation-delay:-2s]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />
      {/* Extra decorative glow orb */}
        <motion.div
          className="absolute right-[15%] top-[18%] h-32 w-32 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(43,224,210,0.3) 0%, transparent 70%)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
      </motion.div>

      {/* ── 3D hand — recedes deepest of all layers ── */}
      <motion.div
        style={{ y: handY, scale: handScale, opacity: handOpacity }}
        className="pointer-events-none absolute inset-0 z-[2]"
        aria-hidden
      >
        <motion.div
          className="absolute inset-0 h-full w-full overflow-hidden"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <RobotScene />
        </motion.div>
      </motion.div>

      {/* ── Copy — sinks, shrinks and fades first (nearest to the viewer) ── */}
      <motion.div
        style={{ y: contentY, scale: contentScale, opacity: contentOpacity }}
        className="relative z-10 w-full"
      >
      <motion.div
        className="container-content relative z-10"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={item} className="mono-label mb-6 flex items-center gap-3 text-text-tertiary">
          <span className="inline-block h-px w-10 bg-accent" aria-hidden />
          EST. 2019 · DHAKA, BANGLADESH
        </motion.p>

        {/* Stroke-reveal wordmark */}
        <motion.div
          variants={item}
          className="mb-2 max-w-[360px] md:max-w-[420px]"
        >
          <StrokeRevealText
            text="ACCRC"
            strokeColor="var(--color-glow)"
            delay={0.5}
            duration={1.6}
          />
        </motion.div>

        <SplitReveal
          as="h1"
          delay={0.15}
          className="font-display text-display-xl font-black text-ink"
          lines={[
            <>BUILD</>,
            <>
              WHAT&apos;S <span className="text-accent">NEXT.</span>
            </>,
          ]}
        />

        <motion.p
          variants={item}
          className="mt-7 max-w-md text-body-lg text-text-secondary"
        >
          ACC Robotics Club is a student-led community at Adamjee Cantonment
          College where we build, learn, and compete together.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap gap-4">
          <Magnetic strength={0.2}>
            <a
              href="#join"
              className="inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-4 font-mono text-mono-sm font-bold uppercase tracking-wider text-white shadow-[0_14px_36px_-12px_rgba(14,138,128,0.8)] transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_18px_44px_-12px_rgba(14,138,128,0.9)] active:scale-95"
            >
              Become a member <ArrowRight size={16} aria-hidden />
            </a>
          </Magnetic>
          <Magnetic strength={0.2}>
            <a
              href="#events"
              className="inline-flex items-center gap-2.5 rounded-full border-2 border-border-strong bg-secondary px-8 py-4 font-mono text-mono-sm font-bold uppercase tracking-wider text-ink transition-all duration-200 hover:bg-tertiary active:scale-95"
            >
              View events <CalendarDays size={16} aria-hidden />
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>
      </motion.div>

      {/* Decorative floating lines — inspired by the organic shapes on mindrobotics.com */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-[3] h-40 pointer-events-none"
        aria-hidden
      >
        {/* Large pill shape at bottom-left */}
        <motion.div
          className="absolute -bottom-8 -left-4 h-20 w-[28%] rounded-full bg-secondary/90"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Circle shape at bottom-center */}
        <motion.div
          className="absolute -bottom-4 left-[35%] h-16 w-16 rounded-full bg-glow/15"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>

      {/* Coordinates + scroll cue */}
      <div className="mono-label absolute bottom-24 right-6 z-10 hidden text-right leading-7 text-text-tertiary lg:block" aria-hidden>
        23°49&apos;N<br />90°25&apos;E
      </div>
      <motion.a
        href="#mission"
        style={{ opacity: cueOpacity }}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-text-tertiary hover:text-accent transition-colors"
        initial={{ y: 12 }}
        animate={{ y: [0, 8, 0] }}
        transition={{ delay: 1.4, duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Scroll to mission"
      >
        <ChevronDown size={26} />
      </motion.a>
    </section>
  );
}
