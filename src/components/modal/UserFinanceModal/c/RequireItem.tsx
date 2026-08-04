import { Asterisk } from "lucide-react";

export const RequireItem = ({ label, required }: { label: React.ReactNode, required?: boolean }) => {
  return (
    <div className="flex items-center">
      {label} {required && <Asterisk className="text-error w-3 h-3" />}
    </div>
  );
};
