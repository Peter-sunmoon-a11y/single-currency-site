import { useEffect } from "react";

export function useClickAway(ref: React.RefObject<HTMLElement | null>, onClickAway: () => void) {
  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // 如果点击在 ref 内部，不触发 onClickAway
      if (ref.current && ref.current.contains(target)) {
        return;
      }

      onClickAway();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [onClickAway, ref]);
}
