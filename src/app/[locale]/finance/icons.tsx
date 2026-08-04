import React from "react";

export const IconDeposit = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M15 11v.01" />
    <path d="M5.173 8.378a3 3 0 1 1 4.656 -1.377" />
    <path
      d="M16 4v3.803a6.019 6.019 0 0 1 2.658 3.197h1.341a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-1.342c-.336 .95 -.907 1.8 -1.658 2.473v2.027a1.5 1.5 0 0 1 -3 0v-.583a6.04 6.04 0 0 1 -1 .083h-4a6.04 6.04 0 0 1 -1 -.083v.583a1.5 1.5 0 0 1 -3 0v-2l0 -.027a6 6 0 0 1 4 -10.473h2.5l4.5 -3" />
  </svg>
);

export const IconWithdraw = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    <path d="M3 8a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-8" />
    <path d="M18 12h.01" />
    <path d="M6 12h.01" />
  </svg>
);

export const IconSwap = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M17 10h-14l4 -4" />
    <path d="M7 14h14l-4 4" />
  </svg>
);
