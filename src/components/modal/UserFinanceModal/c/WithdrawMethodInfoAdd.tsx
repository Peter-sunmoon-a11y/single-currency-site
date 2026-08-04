import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import { useToggle } from "@/hooks/useToggle";
import clsx from "clsx";
import { TFunction } from "@/lib/i18n/i18next";
import { ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useUserWithdrawFiatInfo } from "@/components/modal/UserFinanceModal/helper.ts";
import { orderBy } from "es-toolkit";
import { deleteUserWithdrawInfo, setUserWithdrawInfoDefaultById } from "@/services/auth/wallet";
import { sleep } from "@/components/socialLogin/helper.ts";
import {
  DisplayContent,
  ImageWithPlaceholder,
  InnerMaintenance
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { Modal } from "@/components/ui/Modal.tsx";

interface StateProps {
  selected: Record<string, any> | undefined;
  create: boolean;
}

const initState = {
  selected: undefined,
  create: false
};

export const WithdrawMethodInfoAdd = () => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<StateProps>(initState);

  // from data store, share common data
  const { withdrawFiat, withdrawFiatV2, openModal, setWithdrawFiatV2 } = useBoundStore();

  // 法币提现用用户添加的快捷信息列表
  const { data: wallets, isLoading: l1 } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  // 法币提现用用户添加的快捷信息列表
  const currentWallet = useMemo(() => (Array.isArray(wallets?.data) ? wallets?.data : []), [wallets]);

  // 设置默认选中
  useEffect(() => {
    /**
     * FIXME: 这是什么错误
     * {
     *     "code": 500,
     *     "msg": "UserWithdrawInfo Data failed",
     *     "data": "Undefined array key \"bind\""
     * }
     */
    if (currentWallet.length > 0) {
      setStatus((old) => ({
        ...old,
        selected: currentWallet.find((c: { is_default: number; }) => c.is_default === 1)
      }));

      setWithdrawFiatV2({ method: currentWallet.find((c: { is_default: number; }) => c.is_default === 1) });
    } else {
      setWithdrawFiatV2({ method: null, formItem: { amount: "" } });
    }
  }, [currentWallet]);

  return (
    <div className={"flex flex-col gap-2"}>
      <p className="text-xs text-base-content/50 font-semibold">{t("finance:withdrawalDetails")}</p>
      <div className="bg-base-200 rounded-lg flex flex-col justify-center">
        <SmallLoading loading={l1} content={null} className="h-52" />

        {/* 无快捷信息 */}
        <DisplayContent status={!l1 && (currentWallet.length === 0)}>
          <InnerAddAddr t={t} onClick={() => {
            openModal("OPEN_WITHDRAW_METHOD_ADD_MODAL");
          }} />
        </DisplayContent>

        {/* 有快捷信息 */}
        <DisplayContent status={!l1 && currentWallet.length > 0}>
          <div className="relative">
            {/* 当前正在使用的快捷信息 */}
            {(withdrawFiatV2.method) && <InnerAddress
              data={withdrawFiatV2.method}
              extra={
                <button
                  className="z-1 btn btn-square btn-sm btn-soft btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatus((v) => ({ ...v, create: !status.create }));
                    return false;
                  }}
                >
                  <ChevronsUpDown className="text-primary w-4 h-4" strokeWidth={4} />
                </button>
              }
            />}
            {/* 未选择快捷信息 */}
            {(!withdrawFiatV2.method && currentWallet.length > 0) && <InnerPleaseSelect extra={<button
              className="btn btn-square btn-sm btn-soft btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                setStatus((v) => ({ ...v, create: !status.create }));
                return false;
              }}
            >
              <ChevronsUpDown className="text-primary w-4 h-4" strokeWidth={4} />
            </button>} />}

            <Modal isOpen={status.create} onClose={() => setStatus((old) => ({ ...old, create: false }))}
                   title={t("finance:withdrawalAddress")} position="modal-middle">
              <div className="flex flex-col gap-1">
                <InnerAddressList
                  data={currentWallet}
                  onSelect={async (v: Record<string, any>) => {
                    setWithdrawFiatV2({ method: v });

                    await sleep(250);

                    setStatus((old) => ({ ...old, create: false }));

                    void setUserWithdrawInfoDefaultById({ id: v?.id });
                  }}
                />
                <InnerAddAddr
                  t={t}
                  onClick={() => {
                    setStatus((old) => ({ ...old, create: false }));
                    openModal("OPEN_WITHDRAW_METHOD_ADD_MODAL");
                  }}
                />
              </div>
            </Modal>
          </div>
        </DisplayContent>
      </div>
    </div>
  );
};


// 触发新增地址窗口
const InnerAddAddr = ({ t, onClick, className }: { t: TFunction; onClick: () => void; className?: string }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-base-200 flex cursor-pointer justify-between items-center gap-4 rounded-lg p-4 transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-4 font-semibold">
        <img src="/images/finance/deposit.png" className="h-9 w-9" alt="" />
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold">{t("finance:add_withdrawal_address")}</p>
          <p
            className="text-sm text-base-content/50">{t("finance:fill_in_your_fiat_currency_withdrawal_information")}</p>
        </div>
      </div>
      <button className="btn btn-square btn-sm btn-soft">
        <Plus className="text-primary w-4 h-4" strokeWidth={4} />
      </button>
    </div>
  );
};
// 地址详情
const InnerAddress = (
  {
    data,
    edit,
    extra,
    trash,
    className,
    onClick
  }: {
    data: Record<string, any>;
    edit?: boolean;
    trash?: boolean;
    extra?: ReactNode;
    className?: string;
    onClick?: (v: Record<string, any>) => void;
  }) => {
  const { withdrawFiat, withdrawFiatV2 } = useBoundStore();
  const isDarkTheme = () => document.documentElement.getAttribute("data-theme") !== "light";
  const isDark = isDarkTheme();
  const displayIcon = isDark ? data?.icon : (data?.icon_light ?? data?.icon);

  // 法币提现用用户添加的快捷信息列表
  const { refetch, isFetching } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  const [loading, { set }] = useToggle<boolean>(false);

  const source = useMemo(() => data?.params ? orderBy(Object.values(parser(data?.params)) as Record<string, any>[], ["weight"], ["desc"]) : [], [data?.params]);

  return <div
    className={clsx("relative bg-base-200 flex items-center gap-2 px-4 py-4 rounded-lg", className)}
    onClick={() => {
      if (withdrawFiatV2.method?.id !== data?.id && (!loading || isFetching)) onClick?.(data);
    }}
  >
    <InnerDisplayContent show={Boolean(edit)}>
      <input type="radio" readOnly checked={withdrawFiatV2.method?.id === data?.id}
             className="radio radio-sm radio-primary" />
    </InnerDisplayContent>
    <ImageWithPlaceholder src={displayIcon} />
    <div className="flex-1 flex flex-col text-xs">
      {
        source.map((v: any) => {
          if (["accountname", "name"].includes(v.name)) {
            return (<div key={v.name} className="flex items-center gap-1 font-bold text-sm">
              {data[v.name]}
            </div>);
          }
          if (!v.hide) {
            return (<div key={v.name} className="text-base-content/50">{data[v.name]}</div>);
          }
          return null;
        })
      }
    </div>
    {extra}
    {trash && ((loading) ? <span className="loading loading-spin loading-xs" /> :
      <Trash2 className="text-base-content/50 w-4 h-4 cursor-pointer" onClick={
        async (e) => {
          e.stopPropagation();
          set(true);
          await deleteUserWithdrawInfo({ id: data?.id });
          void refetch();
          set(false);
        }} />)}
    <InnerMaintenance show={data.status === 0} className="py-0.5 rounded-bl-field rounded-tr-field top-0 right-0" />
  </div>;
};
// 地址列表
const InnerAddressList = (
  {
    data,
    onSelect
  }: {
    data: Record<string, any>[];
    onSelect: (v: Record<string, any>) => void;
  }) => {
  const { t } = useTranslation();

  const { withdrawFiat } = useBoundStore();

  // 法币提现用用户添加的快捷信息列表
  const { isFetching } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  return (
    <>
      {isFetching &&
        <div className="text-[12px] font-bold text-center text-base-content/50">
          {t("finance:updating_withdrawal_address", "Updating withdrawal address, please wait...")}
        </div>}
      {data.map((item) => (
        <InnerAddress
          key={item.id}
          data={item} edit
          // trash={withdrawFiatV2?.method?.id !== item?.id}
          trash
          onClick={onSelect} />
      ))}
    </>
  );
};

const InnerPleaseSelect = ({ extra }: { extra: ReactNode }) => {
  const { t } = useTranslation();
  return (<div
    className={clsx("relative bg-base-200 flex items-center gap-2 p-4 rounded-lg")}>
    <div className="flex-1 flex flex-col text-xs">
      {t("finance:please_select_withdrawal_method", "Please select a withdrawal method.")}
    </div>
    {extra}
  </div>);
};

function parser(payload: string) {
  if (!/^{.*}$/.test(payload)) return payload;
  return JSON.parse(payload);
}

export const InnerDisplayContent = ({ show, children }: { show: boolean, children: ReactNode }) => {
  return show ? (children) : null;
};
