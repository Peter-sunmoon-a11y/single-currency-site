import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import { useBoundStore } from "@/store";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/services/auth/user";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { AvatarModal } from "./AvatarModal.tsx";

export function ProfileAvatar() {
  const { t } = useTranslation("profile");

  const user = useBoundStore((state) => state.user);

  const { refetchUser: refetch } = useAuth();

  const [status, setStatus] = useState<{
    loading: boolean
    nickname: string
    showAvatar: boolean
  }>({
    loading: false,
    nickname: "",
    showAvatar: false
  });

  // 昵称格式验证
  const nickname_error = useMemo(() => status.nickname !== "" && !/^[A-Za-z_][A-Za-z0-9_]{5,15}$/.test(status.nickname), [status.nickname]);

  const handle = () => {
    setStatus((v) => ({ ...v, loading: true }));

    updateUser({
      nickname: status.nickname
    })
      .then((res) => {
        if (res.code === 0) {
          void refetch();
          toast.success(t("toast:editSuccess"));
        } else {
          toast.error(t("toast:editError"));
        }
      }).catch((error) => {
      console.info(error);
    })
      .finally(() => {
        setStatus((v) => ({ ...v, loading: false }));
      });
  };

  // 设置默认数据
  useEffect(() => {
    if (user?.nickname) setStatus((v) => ({ ...v, nickname: user?.nickname }));
  }, [user?.nickname]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base text-primary font-bold border-l-4 pl-2 border-l-primary">
        {t("common:common.profile")}
      </h3>
      <div className="flex w-full flex-col items-center gap-4">
        {/* 头像编辑 */}
        <div className="relative border-2 border-primary rounded-full cursor-pointer" onClick={() =>
          setStatus((v) => ({ ...v, showAvatar: true }))}>
          <img src={user?.avatar || '/images/avatars/Avatar-0.png'} className="h-20 w-20 rounded-full" alt={""} />
        </div>

        {/* 昵称编辑 */}
        <div className="flex w-full flex-col gap-2 text-base-content">
          <fieldset className="fieldset">
            <h4 className="text-sm">{t("profile:nickname")}</h4>
            <div className="relative">
              <input
                type="text"
                value={status.nickname}
                onChange={(e) => {
                  setStatus((v) => ({ ...v, nickname: e.target.value }));
                }}
                className={"input bg-base-200 w-full !outline-0 border-0 font-bold"}
                maxLength={16}
                minLength={6}
              />
              <ErrorMessageBox
                sample
                show={nickname_error}
                content={t("profile:nicknameIsRequired")} />
            </div>
          </fieldset>

          <p className="relative text-sm text-base-content/50">{t("common:common.usernameDescription")}</p>
        </div>

        <ConfirmBox
          disabled={
            !status.nickname ||
            nickname_error ||
            user?.nickname === status.nickname}
          loading={status.loading} onClick={handle}>
          {t("common:common.save")}
        </ConfirmBox>

        <AvatarModal open={status.showAvatar} onClose={() => setStatus((v) => ({ ...v, showAvatar: false }))} />
      </div>
    </div>
  );
}
