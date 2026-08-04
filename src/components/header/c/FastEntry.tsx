import { getImgCompressParams } from "@/utils/helper.ts";
import { useBoundStore } from "@/store";
import { useAppNavigate } from "@/hooks/useAppNavigate";

const defaultAvatar = "/images/avatars/Avatar-0.png";

export function FastEntry() {

  const user = useBoundStore((state) => state.user);
  const isLoading = !useBoundStore((state) => state.isInitialized);

  return (<div>
    <>
      {
        isLoading
          ? <div className="skeleton bg-base-200 h-8 w-8 rounded-lg md:w-10 md:h-10" />
          : (<div
            className="flex justify-center bg-base-200 h-10 w-10 md:h-10 md:w-10 rounded-lg cursor-pointer p-1"
            onClick={() => navigate({ to: "/profile" })}
          >
            <img
              alt={""}
              loading='lazy'
              decoding='async'
              className="rounded-lg w-full h-full"
              src={user?.avatar ? getImgCompressParams(user?.avatar, 24) : defaultAvatar}
              onError={(e) => {
                // 如果头像加载失败，使用默认头像
                e.currentTarget.src = defaultAvatar;
              }}
            />
          </div>)
      }
    </>
  </div>);
}
