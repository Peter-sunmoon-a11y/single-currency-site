import InternalMessageCounter from "@/components/header/c/InternalMessageCounter.tsx";
import { useBoundStore } from "@/store";

export const InternalMessageEntry = () => {
  const openModal = useBoundStore((state) => state.openModal);

  return <InternalMessageCounter onClick={() => openModal("OPEN_INTERNAL_MESSAGE_MODAL")} />;
};
