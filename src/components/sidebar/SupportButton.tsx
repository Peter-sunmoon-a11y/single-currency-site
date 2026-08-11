import { Headphones } from "lucide-react";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export const SupportButton = ({ onClose }: { onClose?: () => void }) => {
  const navigate = useAppNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        void navigate({ to: "/customer-service" });
        onClose?.();
      }}
      className="w-full flex items-center justify-between gap-2 pl-2 py-2 pr-2 transition-all duration-200 relative text-base-content/70 active:bg-base-200 focus-visible:bg-base-200 active:text-base-content focus-visible:text-base-content bg-base-100 rounded-lg bg-gradient-to-r from-primary/25 to-primary/8 border-l-2 border-primary/50"
    >
      <div className="flex items-center gap-x-2 min-w-0 overflow-hidden">
        <Headphones className="w-4 h-4 shrink-0 text-base-content" />
      </div>
    </button>
  );
};
