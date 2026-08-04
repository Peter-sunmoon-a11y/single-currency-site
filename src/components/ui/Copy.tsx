import { ReactNode, useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import clsx from "clsx";

export interface CopyProps {
  icon?: ReactNode; // 拷贝的icon
  text: string;
  trigger?: ReactNode;
  onCopy?: () => void;
  copyCls?: string; // 默认状态的的icon颜色class
  copiedCls?: string; // 已拷贝状态的icon颜色class
  className?: string;
}

const Copy = ({ text, onCopy, copyCls, copiedCls }: CopyProps) => {
  const { t } = useTranslation();

  const [v, setV] = useState<boolean>(false);

  useEffect(() => {
    if (!v) return;
    const t = setTimeout(() => {
      setV(() => false);
    }, 1000);

    return () => clearTimeout(t);
  }, [v]);

  return text ? (
    <CopyToClipboard
      text={text}
      onCopy={() => {
        setV(true);
        onCopy?.();
        toast.success(t("transaction:common.copied"));
      }}
    >
      <span className={clsx(!v ? copyCls || "text-base-content/50" : copiedCls || "text-primary", "btn btn-square btn-sm")}>
        {<CopyIcon size={14} />}
      </span>
    </CopyToClipboard>
  ) : null;
};

export default Copy;
