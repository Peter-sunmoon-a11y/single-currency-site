import { cn } from "@/utils/cn";
import { usePortalContainer } from "@/contexts/PortalContainerContext";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// `vh` 兜底旧浏览器，支持 `dvh` 的环境再覆盖，避免移动端地址栏伸缩导致弹窗高度跳变。
const MODAL_MAX_HEIGHT_CLASS = "max-h-[calc(100vh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem)] supports-[height:100dvh]:max-h-[calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-2rem)]";

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  return { isOpen, openModal, closeModal };
};

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  hideTitle?: boolean;
  className?: string;
  closeButtonClassName?: string;
  id?: string;
  position?: "modal-bottom" | "modal-middle" | "";
  style?: React.CSSProperties;
  zIndex?: number;
  outsideClose?: boolean;
  classNameModal?: string;
};

export function Modal({
  isOpen,
  onClose,
  title = "Modal",
  hideTitle = false,
  children,
  className,
  closeButtonClassName,
  id = "modal",
  position = "",
  zIndex = 1001,
  style,
  outsideClose = true,
  classNameModal,
}: ModalProps) {
  const portalContainer = usePortalContainer();
  const modalRef = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const modalId = `${id}_${uid}`;
  const titleId = `${modalId}-title`;

  useLayoutEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (isOpen) {
      // show() 代替 showModal()，避免进入 top layer，让 z-index 正常生效
      if (!modal.open) modal.show();
    } else if (modal.open) {
      modal.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (isOpen) {

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          const active = document.activeElement;
          if (active instanceof HTMLElement) active.blur();
          if (window.scrollY !== 0) window.setTimeout(() => window.scrollTo(0, 0), 0);
          onClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    } else {
      const active = document.activeElement;
      if (active instanceof HTMLElement) active.blur();
      if (window.scrollY !== 0) window.setTimeout(() => window.scrollTo(0, 0), 0);
    }
  }, [isOpen, onClose]);

  // SSR 守卫 + 条件挂载：关闭时卸载 children，避免闭合状态下的无效渲染
  if (typeof document === "undefined" || !isOpen) return null;

  return createPortal(
    <dialog
      id={modalId}
      ref={modalRef}
      data-stackable-modal=""
      aria-modal="true"
      aria-labelledby={!hideTitle ? titleId : undefined}
      className={cn("modal", position || "modal-bottom", classNameModal)}
      style={{ zIndex }}
    >
      <div
        className={cn(
          "outline-none modal-box flex flex-col p-4",
          MODAL_MAX_HEIGHT_CLASS,
          className
        )}
        style={style}
      >
        {/* 关闭按钮 */}
        <button
          type="button"
          className={cn("btn btn-sm btn-square absolute top-4 right-4 outline-none", closeButtonClassName)}
          onClick={onClose}
        >
          <X size={16} />
        </button>

        {/* 标题 */}
        {!hideTitle && (
          <div id={titleId} className="mb-2 pr-8 h-8 flex items-center">
            {typeof title === "string"
              ? <h3 className="h-8 font-bold text-base">{title}</h3>
              : title}
          </div>
        )}

        {/* 内容 */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">{children}</div>
      </div>

      {/* 背景遮罩 */}
      {outsideClose && (
        <div className="modal-backdrop bg-base-300/75" onClick={onClose} />
      )}
    </dialog>,
    portalContainer ?? document.body,
  );
}
