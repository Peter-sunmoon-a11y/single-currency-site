import { useTranslation } from "@/lib/i18n/react-i18next";
import { useTournamentPoolPrize } from "@/hooks/api/useAuth";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";
import { getTournamentImage } from "./tournament-visuals";

export interface TournamentCardData {
  id: string;
  title: string;
  titleHighlight?: string;
  endTime: number;
  prizePool: number;
  image: string;
  provider?: string;
  tournamentId?: number | string;
  tournamentLevel?: string;
}

interface TournamentCardProps {
  data: TournamentCardData;
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  contentClsx?: string;
  bannerHeight?: string;
}

export const TournamentCard = ({ data, onClick }: TournamentCardProps) => {
  const { t } = useTranslation("tournament");
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { data: livePrize } = useTournamentPoolPrize(data.tournamentId, data.tournamentLevel);

  const prizePoolValue = livePrize ?? data.prizePool ?? 0;
  const formattedPrize = formatWithConversion(prizePoolValue, "USD", {
    showCode: false,
    showSymbol: true
  });

  const image = getTournamentImage(data.provider, "mobile") || data.image;

  return (
    <div
      className="relative overflow-hidden rounded-lg min-h-[110px] bg-base-200"
      onClick={onClick}
    >
      {/* 背景图，压低透明度作为氛围底纹 */}
      <img
        src={image}
        alt={data.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-right opacity-20"
      />

      {/* 内容 */}
      <div className="relative z-10 h-full flex flex-col justify-between p-4">
        {/* 标题区 */}
        <h3 className="text-primary text-lg font-black uppercase italic">
          {t(data.title, data.title)}
        </h3>

        {/* 底部：奖池 + 倒计时 */}
        <div className="flex items-start justify-between gap-2">
          {/* 奖池 */}
          <div>
            <p className="text-[12px] text-base-content uppercase font-bold">
              {t("tournament:progressivePrizePool")}
            </p>
            <p className="text-xl font-bold text-primary">
              {formattedPrize.formatted}
            </p>
          </div>

          {/* 倒计时 badge */}
          <div className="flex flex-col items-end gap-0.5">
            <p className="text-[12px] text-base-content uppercase font-bold">
              {t("tournament:endingIn")}
            </p>
              <CountdownTimer expireTime={data.endTime} className="text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
