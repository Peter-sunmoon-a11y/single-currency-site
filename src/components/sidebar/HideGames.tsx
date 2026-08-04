import { useTranslation } from "@/lib/i18n/react-i18next";
import clsx from "clsx";
import { ChangeEvent, useEffect, useState } from "react";
import { updateUser } from "@/services/auth/user";
import { useBoundStore } from "@/store";
import { sleep } from "@/components/socialLogin/helper.ts";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEYS } from "@/hooks/api/useAuth.ts";

export const HideGames = ({ onClose }:{ onClose: () => void }) => {
  const { t } = useTranslation();

  const user = useBoundStore((s) => s.user);
  const queryClient = useQueryClient();

  const [checked, setCheckbox] = useState(false);

  useEffect(() => {
    const id = user?.id;
    if (!id) return;

    const value = sessionStorage.getItem(`hide_games_${id}`);
    setCheckbox(value !== null ? value === "true" : user.is_show_blocked_games === 1);
  }, [user?.id, user?.is_show_blocked_games]);

  const handle = async (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();

    setCheckbox(e.target.checked);

    // 乐观更新
    sessionStorage.setItem(`hide_games_${user?.id}`, String(e.target.checked));

    await sleep(200);

    onClose();

    await updateUser({ is_show_blocked_games: e.target.checked });

    // 更新 RQ 缓存，AuthContext sync effect 自动同步到 store
    queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, (old: any) =>
      old ? { ...old, user: { ...old.user, is_show_blocked_games: e.target.checked ? 1 : 0 } } : old
    );
  };

  return (
    user && <button className="justify-between btn btn-md md:btn-lg w-full">
      <div className="flex items-center gap-x-3 overflow-hidden">
        <span className="text-sm truncate">{t("menu:hideBlockedGames")}</span>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={handle}
        className={clsx("toggle toggle-xs", checked ? "toggle-primary" : "")}
      />
    </button>
  );
};
