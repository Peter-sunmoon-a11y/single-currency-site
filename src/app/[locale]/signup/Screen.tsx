import { useEffect } from "react";
import { AuthContent } from "@/components/auth/AuthContent";
import { useBoundStore } from "@/store";
import { useAppNavigate } from "@/hooks/useAppNavigate";

function SignupPage() {
  const navigate = useAppNavigate();
  const isAuthenticated = !!useBoundStore((state) => state.user);
  const isInitialized = useBoundStore((state) => state.isInitialized);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate({ to: "/casino", search: undefined });
    }
  }, [isAuthenticated, isInitialized, navigate]);

  return (
    <div className="bg-base-100 h-full">
      <AuthContent
        initialTab="signup"
        onClose={() => navigate({ to: "/casino", search: undefined })}
        isActive={true}
      />
    </div>
  );
}
export const beforeLoad = undefined;

export default SignupPage;
