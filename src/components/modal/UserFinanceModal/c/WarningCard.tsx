import { ReactNode } from "react";

export const WarningCard = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className="flex items-center gap-4 rounded-lg p-4 text-base-content/50"
      style={{
        background: `
        radial-gradient(100% 157.05% at 0% 46.47%, 
        color-mix(in oklch, var(--color-accent), transparent 70%) 50%,
        color-mix(in oklch, var(--color-base-300), transparent 30%)`,
      }}
    >
      <img src="/icons/isometric/23.svg" className="h-12 w-12" alt="Secure" />
      {children}
    </div>
  );
};
