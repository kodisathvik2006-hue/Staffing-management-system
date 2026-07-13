"use client";

import React from "react";

export const GridBackground = () => {
  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none opacity-[0.25] dark:opacity-[0.05]"
      style={{
        backgroundImage: `
          linear-gradient(to right, #64748b 1px, transparent 1px),
          linear-gradient(to bottom, #64748b 1px, transparent 1px)
        `,
        backgroundSize: '4rem 4rem',
        maskImage: 'radial-gradient(ellipse at 50% 40%, black 10%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 10%, transparent 80%)'
      }}
    />
  );
};
