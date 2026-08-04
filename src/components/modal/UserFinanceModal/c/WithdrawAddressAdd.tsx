import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useUserWithdrawWallet } from "@/hooks/api/useAuth.ts";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import { useToggle } from "@/hooks/useToggle";
import clsx from "clsx";
import { TFunction } from "@/lib/i18n/i18next";
import { ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { DisplayContent } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { deleteUserWithdrawWallet } from "@/services/auth/wallet";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { Modal } from "@/components/ui/Modal.tsx";

interface StateProps {
  selected: Record<string, any> | undefined;
  create: boolean;
}

const initState = {
  selected: undefined,
  create: false
};

export const WithdrawAddressAdd = () => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<StateProps>(initState);

  const { withdrawCrypto, setWithdrawCrypto, openModal } = useBoundStore();

  // 用户钱包地址列表
  const { data: wallets, isLoading: l1 } = useUserWithdrawWallet(withdrawCrypto.network?.network);

  // 当前网络的用户钱包地址
  const currentWallet = useMemo(() => {
    return (wallets?.data ?? []).filter((o: { network: string }) => o.network === withdrawCrypto.network?.network);
  }, [wallets, withdrawCrypto.network]);

  /**
   * FIXME:
   *  1. 有些网关没钱包地址
   *  2. 有些网关用户添加了地址
   *  切换数据的时候要重置存储的值
   */
  useEffect(() => {
    if (currentWallet?.length > 0) {
      setStatus((old) => ({ ...old, selected: currentWallet[0] }));
      setWithdrawCrypto({ toWallet: currentWallet[0]?.address });
    } else {
      setStatus((old) => ({ ...old, selected: undefined }));
      setWithdrawCrypto({ toWallet: "", inputAmount: "" });
    }
  }, [currentWallet]);

  return (
    <div className="flex flex-col">
      <p className="pb-2 text-xs text-base-content/50 font-semibold">{t("finance:withdrawalAddress")}</p>

      <div className="min-h-[82px] bg-base-200 rounded-lg">
        <SmallLoading loading={l1} content={null} className="h-[82px]" />

        {/* 当前网络无钱包地址 */}
        <DisplayContent
          status={!l1 && (wallets?.data?.length === 0 || (wallets?.data?.length > 0 && currentWallet.length === 0))}>
          <AddAddr
            t={t}
            onClick={() => {
              openModal("OPEN_WITHDRAW_ADDRESS_ADD_MODAL");
            }}
          />
        </DisplayContent>

        {/* 操作现有地址的入口和窗口 */}
        <InnerDisplayContent show={!l1 && wallets?.data?.length > 0 && currentWallet.length > 0 && !!status.selected}>
          <div className="relative">
            {/* 当前正在使用的钱包地址 */}
            <Address
              data={status.selected!}
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
            />

            <Modal isOpen={status.create} onClose={() => setStatus((old) => ({ ...old, create: false }))}
                   title={t("finance:withdrawalAddress")} position="modal-middle">
              <div className="flex flex-col gap-4">
                <AddressList
                  data={currentWallet}
                  selected={status.selected}
                  onSelect={(v: Record<string, any>) => {
                    setStatus((old) => ({ ...old, selected: v }));

                    setWithdrawCrypto({ toWallet: v?.address });

                    setTimeout(() => {
                      setStatus((old) => ({ ...old, create: false }));
                    }, 100);
                  }}
                />
                <AddAddr
                  t={t}
                  onClick={() => {
                    setStatus((old) => ({ ...old, create: false }));
                    openModal("OPEN_WITHDRAW_ADDRESS_ADD_MODAL");
                  }}
                />
              </div>
            </Modal>
          </div>
        </InnerDisplayContent>
      </div>
    </div>
  );
};

// 触发新增地址窗口
const AddAddr = ({ t, onClick, className }: { t: TFunction; onClick: () => void; className?: string }) => {
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
            className="text-sm text-base-content/50">{t("finance:kindly_fill_in_your_crypto_withdrawal_address_details")}</p>
        </div>
      </div>
      <button className="btn btn-square btn-sm btn-soft">
        <Plus className="text-primary w-4 h-4" strokeWidth={4} />
      </button>
    </div>
  );
};

const Address = ({
                   data,
                   edit,
                   extra,
                   trash,
                   className,
                   selected,
                   onClick
                 }: {
  data: Record<string, any>;
  selected?: Record<string, any>;
  edit?: boolean;
  trash?: boolean;
  extra?: ReactNode;
  className?: string;
  onClick?: (v: Record<string, any>) => void;
}) => {
  const [loading, { set }] = useToggle<boolean>(false);

  // from data store, share common data
  const { withdrawCrypto } = useBoundStore();

  // 用户钱包地址列表
  const { refetch } = useUserWithdrawWallet(withdrawCrypto.network?.network);

  return (
    <div
      className={clsx("bg-base-200 flex items-center gap-2 p-4 rounded-lg font-semibold cursor-pointer", className)}
      onClick={() => onClick?.(data)}
    >
      {edit && <input type="radio" checked={selected?.id === data?.id} className="radio radio-sm radio-primary" />}
      <img src={`/images/currency/${data?.network?.toLowerCase()}.png`} className="h-6 w-6" alt="" />
      <div className="flex-1 flex flex-col gap-2">
        <p className="text-sm font-bold">{data?.name}</p>
        <p className="text-sm text-base-content/50 break-all">{data?.address}</p>
        <span className="badge badge-neutral text-xs rounded-sm px-1.5">{data?.id}</span>
      </div>
      {trash && ((loading) ? <span className="loading loading-spin loading-xs" /> : (
        <Trash2 className="text-base-content/50 w-4 h-4 cursor-pointer" onClick={async (e) => {
          e.stopPropagation();
          set(true);
          await deleteUserWithdrawWallet(data?.network, data?.address);
          void refetch();
          set(false);
        }} />))}
      {extra}
    </div>
  );
};

const AddressList = ({
                       data,
                       selected,
                       onSelect
                     }: {
  data: Record<string, any>[];
  selected?: Record<string, any>;
  onSelect: (v: Record<string, any>) => void;
}) => {
  const { t } = useTranslation();

  // from data store, share common data
  const { withdrawCrypto } = useBoundStore();

  // 用户钱包地址列表
  const { isFetching } = useUserWithdrawWallet(withdrawCrypto.network?.network);

  return (
    <>
      {isFetching &&
        <div className="text-[11px] font-bold text-center text-base-content/50">
          {t("finance:updating_withdrawal_address", "Updating withdrawal address, please wait...")}
        </div>}
      {data.map((item) => (
        <Address key={item.id} data={item} edit trash selected={selected} onClick={onSelect} />
      ))}
    </>
  );
};
