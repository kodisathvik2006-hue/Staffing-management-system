"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export const BlurText = ({ text, delay = 0, className = "" }: BlurTextProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });

  return (
    <motion.h1
      ref={ref}
      initial={{ filter: "blur(12px)", opacity: 0, y: 10 }}
      animate={isInView ? { filter: "blur(0px)", opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {text}
    </motion.h1>
  );
};
