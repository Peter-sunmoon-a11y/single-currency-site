import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import { useBoundStore } from "@/store";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser, uploadPublicImage } from "@/services/auth/user";
import { Modal } from "@/components/ui/Modal.tsx";
import AvatarEditor from "react-avatar-editor";
import { Camera, Hand, Plus, Redo, Undo, ZoomIn, ZoomOut } from "lucide-react";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { cn } from "@/utils/cn";

export function AvatarModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { t } = useTranslation();
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  const [scale, setScale] = useState<number>(1);
  const [rotate, setRotate] = useState<number>(0);

  const user = useBoundStore((state) => state.user);

  const { refetchUser: refetch } = useAuth();

  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const scaleFun = (e: string) => {
    if (e === "+") {
      setScale(Math.min(2, scale + 0.2));
    } else if (e === "-") {
      setScale(Math.max(1, scale - 0.2));
    }
  };

  const rotateFun = (e: string) => {
    if (e === "+") {
      setRotate(rotate + 90);
    } else if (e === "-") {
      setRotate(rotate - 90);
    }
  };

  useEffect(() => {
    if (!user) return;
    setSelectedAvatar(-1);
    if (!user.avatar) { setCustomAvatarUrl(null); return; }
    // Fetch the remote avatar and convert to a data URL so the canvas is not tainted
    fetch(user.avatar)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => setCustomAvatarUrl(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(() => setCustomAvatarUrl(user.avatar));
  }, [user]);

  useEffect(() => {
    setScale(1);
    setRotate(0);
  }, [customAvatarUrl, selectedAvatar]);

  const editorRef = useRef<AvatarEditor>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedAvatar(-1);
        setCustomAvatarUrl(event.target.result as string);
        setIsDisabled(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveAvatar = () => {
    const formData = new FormData();

    if (editorRef.current) {
      // Get the edited canvas
      const canvas = editorRef.current.getImageScaledToCanvas();

      // Convert canvas to blob directly instead of using toDataURL
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "avatar.png", { type: "image/png" });
          formData.append("file", file);

          setLoading(true);
          uploadPublicImage(formData)
            .then((res) => {
              const data = res.data;

              if (res.code === 0) {
                // Handle successful upload
                updateUser({
                  avatar: data.public_url
                })
                  .then((updateRes) => {
                    if (updateRes.code === 0) {
                      void refetch();
                      onClose();
                      toast.success(t("toast:editSuccess"));
                    }
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }
            });
        }
      }, "image/png");
    }
  };

  return (
    <Modal
      position={"modal-middle"} isOpen={open} onClose={onClose}
      title={t("bonus:setavatar")}
    >
      <div className="flex flex-col gap-4">
        <div className="relative mt-2">
          <AvatarEditor
            ref={editorRef}
            image={
              selectedAvatar === -1 && customAvatarUrl
                ? customAvatarUrl
                : `/images/avatars/Avatar-${selectedAvatar}.png`
            }
            width={100}
            height={100}
            border={0}
            color={[0, 0, 0, 0.75]}
            scale={scale}
            rotate={rotate}
            borderRadius={100}
            className="mx-auto"
          />

          <span className="flex items-center gap-2 text-sm font-bold absolute -bottom-8 left-0">
            <Hand className="w-5 h-5" />{t("profile:zoomAndAdjust")}
          </span>

          <div
            className="absolute flex cursor-pointer items-center justify-center w-full h-full top-0 left-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera />
          </div>
        </div>
        <div className="mt-8 bg-base-200 flex h-12 w-full items-center justify-between p-0 rounded-lg">
          <div className="flex h-full w-full items-center justify-around">
            <ZoomOut className={"w-5 h-5"} onClick={() => scaleFun("-")} />
            <div className={"flex"}>
              <input
                type="range"
                min={1}
                max={2}
                step={0.01}
                value={scale}
                className={`range range-xs`}
                onChange={(e) => {
                  setScale(Number(e.target.value));
                }}
              />
            </div>
            <ZoomIn className={"w-5 h-5"} onClick={() => scaleFun("+")} />
            <Undo className={"w-5 h-5"} onClick={() => rotateFun("-")} />
            <Redo className={"w-5 h-5"} onClick={() => rotateFun("+")} />
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-bold">{t("common.defaultAvatars")}</div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 14 }, (_, i) => (
              <div
                key={i}
                onClick={() => { setCustomAvatarUrl(null); setSelectedAvatar(i); setIsDisabled(false); }}
                className={cn("h-10 w-10 rounded-full border-2 transition-colors", selectedAvatar === i ? "border-primary" : "border-transparent")}
              >
                <img src={`/images/avatars/Avatar-${i}.png`} alt={`Avatar ${i}`} className="h-full w-full rounded-full" />
              </div>
            ))}
            <div className="flex h-8 w-8 items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Plus />
            </div>
          </div>
        </div>

        {/* 单个共享文件输入 */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <div>
          <ConfirmBox disabled={loading || isDisabled} loading={loading} onClick={saveAvatar}>
            {t("common:common.save")}
          </ConfirmBox>
        </div>
      </div>
    </Modal>
  );
}
