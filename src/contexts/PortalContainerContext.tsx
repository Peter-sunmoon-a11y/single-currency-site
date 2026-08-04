import { createContext, useContext } from "react";

// 给需要 createPortal 的组件提供挂载容器。
// phone frame 模式下会传入应用框内部节点，普通模式下为空，表示回退到默认 body。
const PortalContainerContext = createContext<HTMLElement | null>(null);

export const PortalContainerProvider = PortalContainerContext.Provider;
export const usePortalContainer = () => useContext(PortalContainerContext);
