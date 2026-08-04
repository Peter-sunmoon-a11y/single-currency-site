import { Modal } from "@/components/ui/Modal";
import { buildConfig } from "@/lib/env";
import { useTranslation } from "@/lib/i18n/react-i18next";
import Iconify from "@/components/iconify";
import { ReactNode, useEffect, useState } from "react";
import clsx from "clsx";
import { getImgCompressParams, getPathInROIBEST } from "@/utils/helper.ts";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";

export const GameDetailsModal = ({ open, data, onClose }: {
  open: boolean;
  data: Record<string, any>
  onClose: () => void;
}) => {
  const { t, i18n } = useTranslation(["common", "menu", "gameDetail", "bonus"]);

  const [, setGameInfoTransLoaded] = useState(false);

  /**
   * TODO
   *  拆分游戏信息的翻译文件按需加载
   *  之前的文件体积过大,加载时间长,维护困难
   */
  useEffect(() => {
    const provider = data?.game_provider;
    if (!provider) return;

    const namespace = `game_${provider}`;

    // 检查是否已经加载过
    if (i18n.hasResourceBundle(i18n.language, namespace)) {
      setGameInfoTransLoaded(false);
      return;
    }

    setGameInfoTransLoaded(true);

    fetch(`${getPathInROIBEST()}/locales/${i18n.language}/games/${namespace}.json?v=${buildConfig.version}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        i18n.addResourceBundle(i18n.language, namespace, data, true, true);
        setGameInfoTransLoaded(false);
      })
      .catch(error => {
        console.error(`Failed to load ${namespace}:`, error);
        setGameInfoTransLoaded(false);
      });
  }, [i18n.language, data?.game_provider]);

  return (
    <Modal
      title={''}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <img
            src={getImgCompressParams(data?.image, 96, 100, 128)}
            alt={data?.display_game_name}
            loading="lazy"
            className="w-24 h-32 rounded-md object-cover shrink-0" />
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-base font-bold">{data?.display_game_name}</p>
            <span className={"font-bold italic text-sm text-primary"}>{data?.provider_name}</span>
            {data?.tags && (
              <div className="flex flex-wrap gap-0.5">
                <InnerBadge value={data.tags.split(",")} />
              </div>
            )}
          </div>
        </div>

        {(data?.rtp || data?.max_win) && (
          <div className="grid grid-cols-2 gap-2">
            {data?.rtp && (
              <div className="flex flex-col gap-0.5 bg-base-200 rounded-lg px-2 py-2">
                <span className="text-base-content/50 text-xs">{t("gameDetail:rtp")}</span>
                <span className="font-bold text-sm flex items-center gap-1">
                <Iconify icon="custom:percent" className="w-4 h-4" />{data.rtp}
              </span>
              </div>
            )}
            {data?.max_win && (
              <div className="flex flex-col gap-0.5 bg-base-200 rounded-lg px-2 py-2">
                <span className="text-base-content/50 text-xs">{t("gameDetail:maxWin")}</span>
                <span className="font-bold text-sm flex items-center gap-1">
                <Iconify icon="custom:max-win" className="w-4 h-4" />{data.max_win}
              </span>
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold mb-2">{t("gameDetail:gameInformation")}</h3>
          <TextBaseContent text={t(`game_${data?.game_provider}:${data?.game_provider}_${data?.inner_game_id}`)} />
        </div>
      </div>
    </Modal>
  );
};

const Badge = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={clsx("font-bold bg-base-200 px-1 py-0.5 text-base-content/50 text-[12px]", className)}>{children}</div>
);

const InnerBadge = ({ extra, value, className }: { extra?: ReactNode; value: any; className?: string }) => {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) return value.map((tag, i) => <Badge key={i} className={className}>{tag}</Badge>);
  return <Badge className={className}>{extra}{value}</Badge>;
};
