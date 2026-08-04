import { hasMysteryBox } from "@/services/auth/bonus";
import { useBoundStore } from "@/store";
import { useQuery } from "@tanstack/react-query";

export const useHasMysteryBox = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery<any>({
    queryKey: ["hasMysteryBox"],
    queryFn: () => hasMysteryBox(),
    enabled: !!user,
  });
};
