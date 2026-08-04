import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import ReactPaginate, { ReactPaginateProps } from "react-paginate";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useEffect, useState } from "react";
import clsx from "clsx";

const InnerNoData = () => {
  // const { t } = useTranslation("tournament");
  // return <div className="text-xs py-6 font-semibold text-base-content/50">{t("common.noData")}</div>;
  return null;
};

export function Paginate(props: ReactPaginateProps & {
  page: number,
  limit: number,
  jumping?: boolean,
  disabled?: boolean,
  className?: string,
  onJumpPage: (page: number) => void
  onPaginate: (page: number) => void
}) {
  const jumping = props.jumping ?? true;

  const { t } = useTranslation();

  const [innerPage, setInnerPage] = useState<number>(props.page);
  const [jumpingTo, setJumpingTo] = useState<string>("");

  // 同步外部页码保持一致
  useEffect(() => {
    if (Number(props.page) === Number(innerPage)) return;
    setInnerPage(props.page);
  }, [props.page]);

  return (props.pageCount > 1 && <div>
    <div
      className={clsx("flex justify-center", props?.className)}
      onClickCapture={(e) => {
        // disabled 时阻止所有分页点击，但不改动按钮样式（只做功能性禁用）。
        if (!props.disabled) return;
        e.preventDefault();
        e.stopPropagation();
      }}
      onKeyDownCapture={(e) => {
        // disabled 时同时阻止键盘触发的翻页。
        if (!props.disabled) return;
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <ReactPaginate
        pageClassName="page-class-name"
        pageLinkClassName="text-sm font-bold btn btn-square btn-sm bg-base-100 w-auto min-w-8 px-1 text-base-content/50"
        activeLinkClassName="!bg-primary !text-primary-content"
        nextClassName="btn btn-square btn-sm bg-base-100 text-base-content/50"
        nextLinkClassName="next-link-class-name"
        breakClassName="break-class-name"
        breakLinkClassName="btn btn-square bg-base-100 btn-sm"
        previousClassName="btn btn-square btn-sm bg-base-100 text-base-content/50"
        previousLinkClassName="previous-link-class-name"
        containerClassName="flex gap-1 text-xs"
        activeClassName="active-class-name"
        breakLabel={<Ellipsis className={"text-base-content/50"} />}
        nextLabel={<ChevronRight className={"w-4 h-4"} />}
        previousLabel={<ChevronLeft className={"w-4 h-4"} />}
        pageRangeDisplayed={props?.pageRangeDisplayed ?? 1}
        renderOnZeroPageCount={() => <InnerNoData />}
        marginPagesDisplayed={props?.marginPagesDisplayed ?? 2}
        pageCount={props.pageCount}
        forcePage={Math.max(0, innerPage - 1)} // 强制更新页码
        onPageChange={(event) => {
          // 双重保护：即使点击已被 capture 拦截，也避免触发 onPageChange。
          if (props?.disabled) return;
          const next = event.selected + 1;
          setInnerPage(next);
          props.onPaginate(next);
        }}
      />
    </div>

    {/* 跳页支持 */}
    {props.pageCount > 0 && jumping && <div className="flex items-center justify-center gap-2 font-bold mt-4">
      <div className={"flex items-center gap-2 text-base-content/50 text-sm"}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={jumpingTo}
          placeholder={String(innerPage ?? "")}
          className={"text-center input-sm w-20 input rounded-md border-0 bg-base-400 px-2 text-sm font-bold text-primary outline-none"}
          onChange={(e) => setJumpingTo(e.target.value.replace(/\D/g, ""))}
        />
        <span>/{props.pageCount}</span>
      </div>
      <button
        className={"btn btn-sm bg-base-100 text-primary text-sm"}
        disabled={
          props.disabled ||
          Number(jumpingTo || 0) === 0 ||           // 0无需跳转
          Number(jumpingTo || 0) > props.pageCount  // 超出总数无需跳转
        }
        onClick={() => props.onJumpPage(Number(jumpingTo))}
      >{t("tournament:jump")}
      </button>
    </div>}
  </div>);
}
