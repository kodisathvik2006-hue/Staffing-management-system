"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export const CountUp = ({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) => {
  const [parsed, setParsed] = useState({
    prefix: "",
    num: null as number | null,
    suffix: "",
  });

  useEffect(() => {
    const str = String(value);
    // Extracts symbol prefix (e.g. $), the number (e.g. 1,500.50), and suffix (e.g. k)
    const match = str.match(/^([^0-9.-]*)([0-9.,]+)(.*)$/);
    if (match) {
      const prefix = match[1];
      const numStr = match[2].replace(/,/g, "");
      const suffix = match[3];
      const num = parseFloat(numStr);

      if (!isNaN(num)) {
        setParsed({ prefix, num, suffix });
        return;
      }
    }
    // Fallback if not a clean number
    setParsed({ prefix: str, num: null, suffix: "" });
  }, [value]);

  const spring = useSpring(0, { bounce: 0, duration: 1500 });
  
  const display = useTransform(spring, (current) => {
    if (parsed.num === null) return parsed.prefix;

    const hasDecimals = parsed.num % 1 !== 0 || String(value).includes(".");
    const formatted = hasDecimals
      ? current.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : Math.round(current).toLocaleString();

    return `${parsed.prefix}${formatted}${parsed.suffix}`;
  });

  useEffect(() => {
    if (parsed.num !== null) {
      spring.set(parsed.num);
    }
  }, [parsed.num, spring]);

  if (parsed.num === null) {
    return <span className={className}>{value}</span>;
  }

  return <motion.span className={className}>{display}</motion.span>;
};
