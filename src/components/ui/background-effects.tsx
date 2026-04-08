"use client";

import { motion } from "framer-motion";

export function BackgroundEffects() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top, color-mix(in srgb, var(--page-primary) 16%, transparent), transparent 34%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--page-accent) 12%, transparent), transparent 24%)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)] opacity-40" />

      <motion.div
        className="absolute left-1/2 top-[-18rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--page-primary) 28%, transparent), transparent 62%)",
        }}
        animate={{
          opacity: [0.5, 0.85, 0.5],
          scale: [0.96, 1.04, 0.96],
        }}
        transition={{
          duration: 12,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        }}
      />

      <motion.div
        className="absolute left-[-6rem] top-[18rem] h-[22rem] w-[22rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--page-accent) 18%, transparent), transparent 68%)",
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          x: [-18, 14, -18],
        }}
        transition={{
          duration: 10,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        }}
      />

      <motion.div
        className="absolute bottom-[-8rem] right-[-4rem] h-[24rem] w-[24rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--page-primary) 16%, transparent), transparent 68%)",
        }}
        animate={{
          opacity: [0.3, 0.55, 0.3],
          y: [16, -16, 16],
        }}
        transition={{
          duration: 14,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
        }}
      />
    </div>
  );
}
