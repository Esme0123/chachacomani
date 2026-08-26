import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-1.5 z-50 bg-slate-800/40 backdrop-blur-sm">
      <motion.div
        className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 origin-left shadow-[0_0_12px_rgba(245,158,11,0.8)]"
        style={{ scaleX }}
      />
    </div>
  );
}
