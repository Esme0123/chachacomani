import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { temaReglamento } from '../theme/lecturaTemas';

export default function ProgressBar({ tema = temaReglamento }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-1.5 z-[55] bg-cream-300/40 dark:bg-navy-900/80 backdrop-blur-sm">
      <motion.div
        className={`h-full bg-gradient-to-r origin-left ${tema.barraProgreso}`}
        style={{ scaleX }}
      />
    </div>
  );
}