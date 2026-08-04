import { useBoundStore } from "@/store";
import { CardLoading } from "../components/CardLoading";

type UnAuthCardProps = {
  bgcolor?: string;
  title?: string;
  imgSrc?: string;
  titleDom?: React.ReactNode;
};

export const UnAuthCard = ({ bgcolor, title, imgSrc, titleDom }: UnAuthCardProps) => {
  const isInitialized = useBoundStore((state) => state.isInitialized);

  const openModal = useBoundStore((state) => state.openModal);

  if (!isInitialized) return <CardLoading />;
  
  return (
    <div
      onClick={() => {
        openModal("OPEN_AUTH_MODAL", { initialTab: "signin" });
      }}
      className="rounded-lg px-4 sm:px-8 text-center relative overflow-hidden h-[104px] sm:h-[140px] flex items-center cursor-pointer"
      style={{
        background: `
               ${bgcolor},
              linear-gradient(0deg, var(--color-base-300), var(--color-base-300))
            `,
      }}
    >
      <div className="relative z-10 flex items-center h-full justify-between w-full">
        {
          titleDom && (
            titleDom
          )
        }
        {
          title && (
            <h2 className="text-lg font-bold text-base-content text-start leading-5 whitespace-pre-line uppercase">
              {title}
            </h2>
          )
        }
        <img
          src={imgSrc || ""}
          alt="Bonus Store"
          loading="lazy"
          decoding="async"
          className="sm:w-[126px] w-[96px] sm:h-[126px] h-[96px] object-contain"
        />
      </div>
    </div>
  );
};