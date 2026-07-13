"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

export const AuroraBackground = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col overflow-hidden bg-slate-50 dark:bg-[#0f172a] transition-colors",
        className
      )}
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 25,
            ease: "linear",
            repeat: Infinity,
          }}
          className="absolute -inset-[100%] opacity-40 dark:opacity-[0.15] blur-[120px]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.5) 0%, rgba(147, 51, 234, 0.4) 25%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.3) 25%, transparent 50%)",
            backgroundSize: "200% 200%",
          }}
        />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col w-full">
        {children}
      </div>
    </div>
  );
};
