import {
  useSupportedCryptoDepositGateways,
  useSupportedCryptoWithdrawGateways,
  useUserBalance,
  useUserBalanceExtension
} from "@/hooks/api/useAuth.ts";
import { useSupportedCurrencyV2, useSupportedCurrencyV2Filter } from "@/hooks/api/useSupportedCurrency.ts";
import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDepositChannelClassList, getSupportedFiatWithdrawGatewaysV1, getSupportedFiatWithdrawGatewaysV2, getUserWithdrawInfo } from "@/services/auth/wallet";
import Decimal from "decimal.js";
import { useBoundStore } from "@/store";
import { orderBy } from "es-toolkit";
import { emitter } from "@/store/emitter.ts";
import { useCurrencyExchangeRate } from "@/hooks/api/usePublic.ts";
import { EBonus, ESport } from "@/config";
import { o as numericFormatFun } from "@/utils/numericFormat";
import { promoKey } from "@/components/modal/UserFinanceModal/c/SpecialOffers.utils.ts";

export const useSupportedSwapFromCurrenciesFilter = () => {
  const { data, isLoading } = useSupportedCurrencyV2();
  return useMemo(() => {
    const transform = data?.data ?? [];
    const currencies = transform
      .filter((item: {
        can_swap_from: number;
        currency_type: string
      }) => item.currency_type !== "FIAT" && item.can_swap_from === 1)
      .sort((a: { weight: number }, b: { weight: number }) => (b.weight ?? 0) - (a.weight ?? 0));
    return [
      isLoading,
      currencies,
      currencies.map((item: Record<string, any>) => ({
        ...item,
        id: item.currency,
        value: item.currency,
        label: item.display_name,
        icon: `/images/currency/${item.display_name.toLowerCase()}.png`,
        is_default: item.is_default,
      }))
    ]; // 返回 [原始数据, 处理后的数据]
  }, [data]);
};

export const useSupportedSwapToCurrenciesFilter = (currency: Record<string, any> | null) => {
  const { data, isLoading } = useSupportedCurrencyV2();
  return useMemo(() => {
    const transform = data?.data ?? [];

    if (!currency) return [isLoading, [], []];

    const currencies = transform
      .filter(
        (item: { currency: string; can_swap_to: number; currency_type: string }) =>
          (currency?.currency_type === "REWARDS"
            ? item.currency_type !== "REWARDS"
            : item?.currency_type !== "FIAT" && item?.currency_type !== "REWARDS") &&
          item.can_swap_to === 1 &&
          item.currency !== currency?.currency
      )
      .sort((a: { weight: number }, b: { weight: number }) => (b.weight ?? 0) - (a.weight ?? 0));
    return [
      isLoading,
      currencies,
      currencies.map((item: { icon: string; currency: string; display_name: string, is_default: number }) => ({
        id: item.currency,
        value: item.currency,
        label: item.display_name,
        icon: `/images/currency/${item.display_name.toLowerCase()}.png`,
        is_default: item.is_default
      }))
    ]; // 返回 [原始数据, 处理后的数据]
  }, [data, currency]);
};

// 加密货币 - 提款的区块链网关列表
export const useSupportedCryptoDepositGatewaysFilter = (currency: string) => {
  const { data, isLoading } = useSupportedCryptoDepositGateways(currency);
  return useMemo(() => {
    const transform = data?.data ?? [];
    return [
      isLoading,
      transform,
      transform.map((item: { icon: string; network: any; can_withdraw: number }) => ({
        id: item.network,
        value: item.network,
        label: item.network,
        disabled: item.can_withdraw !== 1,
        icon: item.icon || `/images/currency/${item.network.toLowerCase()}.png`
      }))
    ];
  }, [data]);
};

// 加密货币 - 取款的区块链网关列表
export const useSupportedCryptoWithdrawGatewaysFilter = (currency: string) => {
  const { data, isLoading } = useSupportedCryptoWithdrawGateways(currency);
  return useMemo(() => {
    const transform = data?.data ?? [];
    return [
      isLoading,
      transform,
      transform.map((item: { icon: string; network: any; can_withdraw: number }) => ({
        id: item.network,
        value: item.network,
        label: item.network,
        disabled: item.can_withdraw !== 1,
        icon: item.icon || `/images/currency/${item.network.toLowerCase()}.png`
      }))
    ];
  }, [data]);
};

export const validateAddress = (network: string, address: string) => {
  if (network === "TRON") {
    // 不做 Base58Check 校验和，仅做常见格式判断
    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
  }

  if (network === "TON") {
    // 1) 用户友好地址（base64url，常见 48 位）
    if (/^[A-Za-z0-9\-_]{48}$/.test(address)) return true;

    // 2) 原始形式：workchain:hex（例如 0:... 或 -1:...，hash 64 hex）
    return /^-?\d+:[0-9a-fA-F]{64}$/.test(address);
  }

  if (network === "BSC" || network === "ETH") {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  if (network === "SOL") {
    if (!(/^[1-9A-HJ-NP-Za-km-z]+$/.test(address))) return false;
    // Solana 公钥 base58 长度通常在 32~44 之间（宽松判断）
    return address.length >= 32 && address.length <= 44;
  }

  if (network === "BTC") {
    // Legacy Base58（不做 Base58Check 校验和）
    // 1... / 3... 常见长度 26-35
    if (/^[13][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address)) return true;

    // Bech32（不做 bech32 checksum 校验）
    // 允许 bc1 + 11~71 位（实际有更具体长度规则，这里做宽松格式判断）
    // 只允许小写（bech32 标准一般用全小写/全大写，这里按常见全小写处理）
    return /^bc1[ac-hj-np-z02-9]{11,71}$/.test(address);
  }

  return /^[a-zA-Z0-9]{20,}$/.test(address);
};

export const perRangeOptions = [
  {
    label: "Min",
    value: 0
  },
  {
    label: "25%",
    value: 0.25
  },
  {
    label: "50%",
    value: 0.5
  },
  {
    label: "Max",
    value: 1
  }
];

/**
 * 用户的可操作余额
 * @param currency
 */
export const useAvailableBalance = (currency: string) => {
  const {
    data: userBalance,
    isLoading: userBalanceLoading,
    refetch: userBalanceRefetch
  } = useUserBalance();

  const {
    data: userBalanceExtension,
    isLoading: userBalanceExtensionLoading,
    refetch: userBalanceExtensionRefetch
  } = useUserBalanceExtension();

  return useMemo(() => {
    const balance = userBalance?.find((b: Record<string, any>) => b.currency === currency);

    if (!balance) return {
      locked: "0.00",
      available: open_debug ? "200" : "0.00",
      userBalanceLoading,
      userBalanceExtensionLoading,
      userBalanceRefetch,
      userBalanceExtensionRefetch
    };

    const extensionBalance = userBalanceExtension?.find((b: Record<string, any>) => b.currency === currency);

    const totalBalance = new Decimal(balance.balance);
    const withdrawAble = extensionBalance ? new Decimal(extensionBalance.withdraw_able || 0) : new Decimal(0);
    const lockedBalance = extensionBalance ? new Decimal(extensionBalance.locked_balance || 0) : new Decimal(0);

    const calculatedAvailable = totalBalance.minus(lockedBalance);
    const availableMax = Decimal.max(calculatedAvailable, withdrawAble);
    const availableAmount = Decimal.min(availableMax, totalBalance);

    return {
      locked: lockedBalance.toFixed(18, Decimal.ROUND_UP),
      available: open_debug ? "200" : availableAmount.toFixed(18, Decimal.ROUND_DOWN),
      totalBalance: totalBalance.toFixed(18, Decimal.ROUND_DOWN),
      userBalanceLoading,
      userBalanceExtensionLoading,
      userBalanceRefetch,
      userBalanceExtensionRefetch
    };
  }, [
    currency,
    userBalance,
    userBalanceExtension,
    userBalanceLoading,
    userBalanceExtensionLoading,
    userBalanceRefetch,
    userBalanceExtensionRefetch
  ]);
};

export const useAllAvailableBalance = () => {
  const {
    data: userBalance,
    isLoading: userBalanceLoading
  } = useUserBalance();

  const { data: exchangeRate } = useCurrencyExchangeRate();

  return useMemo(() => {
    const output = (userBalance ?? []).map((currency: Record<string, any>) => {
      const token = currency?.currency;
      const balance = currency?.balance || 0;
      const exchange = exchangeRate?.data?.[token] ?? 0;
      const totalBalance = new Decimal(balance);
      const equivalentU = totalBalance.times(exchange).toNumber(); // ⚠️orderBy排序要基于数字不是字符串

      return { token, balance: totalBalance.toString(), equivalentU };
    });

    return {
      balances: orderBy(output, ["equivalentU"], ["desc"]) as { token: string, balance: string, equivalentU: number }[],
      isLoading: userBalanceLoading
    };
  }, [userBalance, exchangeRate]);
};

/**
 * 法币提现支持的网关V1
 * @param currency
 */
export const useSupportedFiatWithdrawGatewaysV1 = (currency: string) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: ["supportedFiatWithdrawGateways", currency],
    queryFn: async () => {
      return getSupportedFiatWithdrawGatewaysV1(currency);
    },
    enabled: !!currency && !!user
  });
};

/**
 * 法币提现支持的网关V2
 * @param currency
 */
export const useSupportedFiatWithdrawGatewaysV2 = (currency: string) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: ["supportedFiatWithdrawGatewaysV2", currency],
    queryFn: async () => {
      return getSupportedFiatWithdrawGatewaysV2(currency);
    },
    enabled: !!currency && !!user
  });
};

/**
 * 法币存款通道分类支持
 * @param currency
 */
export const useDepositChannelClassList = (currency: string) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: ["depositChannelClassList", currency],
    queryFn: async () => {
      return getDepositChannelClassList(currency);
    },
    enabled: !!currency && !!user
  });
};

/**
 * 法币提现用用户添加的快捷信息列表
 * @param currency
 */
export const useUserWithdrawFiatInfo = (currency: string) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: ["userWithdrawFiatInfo", currency],
    queryFn: async () => {
      return getUserWithdrawInfo(currency);
    },
    enabled: !!currency && !!user,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
};

export { useSupportedCurrencyV2, useSupportedCurrencyV2Filter } from "@/hooks/api/useSupportedCurrency.ts";

/*******************************/
/*******************************/
/*******************************/

/**
 * 前提 - 用户在设置结算币的时候，需要更新数据 /Currency/index_V2
 * 存款 - 默认币种的设置依赖于 /Currency/index_V2 的 is_default 字段
 * 存款 - 操作面板 crypto - 加密货币存款时候默认选中的币种
 * 根据币种类型来激活对应的Tab项 setDepositType
 */
export const useDepositCryptoCurrencySelectedFirstTime = () => {
  const [, originCurrencies] = useSupportedCurrencyV2Filter("CRYPTO", "DEPOSIT");

  // from data store, share common data
  const { setDepositCrypto, setDepositType } = useBoundStore();

  // initial default selected option
  useEffect(() => {
    if (originCurrencies.length > 0) {
      const find = originCurrencies.find((o: {
        is_default: number,
        currency_type: string
      }) => o?.is_default && o?.currency_type === "CRYPTO");
      setDepositType(find ? "crypto" : "fiat");
      setDepositCrypto({ currency: find || originCurrencies[0] });
    }
  }, [originCurrencies]);
};

/*******************************/
/*******************************/
/*******************************/

/**
 * 前提 - 用户在设置结算币的时候，需要更新数据 /Currency/index_V2
 * 存款 - 默认币种的设置依赖于 /Currency/index_V2 的 is_default 字段
 * 存款 - 操作面板 fiat - 法币存款时候的默认选中法币
 * 根据币种类型来激活对应的Tab项 setDepositType
 */
export const useDepositFiatCurrencySelectedFirstTime = () => {
  // from data store, share common data
  const setDepositFiat = useBoundStore((state) => state.setDepositFiat);
  const setDepositType = useBoundStore((state) => state.setDepositType);

  // 支持存款的法币列表
  const [, originCurrencies] = useSupportedCurrencyV2Filter("FIAT", "DEPOSIT");

  useEffect(() => {
    if (originCurrencies.length > 0) {
      const find = originCurrencies.find((o: {
        is_default: number,
        currency_type: string
      }) => o?.is_default && o?.currency_type === "FIAT") ?? originCurrencies[0];
      setDepositType(find ? "fiat" : "crypto");
      setDepositFiat({ currency: find });
    }
  }, [originCurrencies]);
};

/*******************************/
/*******************************/
/*******************************/

export const useWithdrawSelectedFirstTime = () => {
  // from data store, share common data
  const { setWithdrawType, setWithdrawFiat, setWithdrawCrypto } = useBoundStore();

  // 按照U的价值排好序的数据
  const { balances } = useAllAvailableBalance();

  const { data: currencies } = useSupportedCurrencyV2();

  useEffect(() => {
    if (!currencies?.data || currencies?.data?.length === 0) return;

    // 支持 提现 操作的币种【加密货币 & 法币】
    const can_withdraw_currencies = currencies.data.filter((o: { can_withdraw: number }) => o.can_withdraw === 1);

    /**
     * 币种类型 查找币种
     * @param type
     */
    const find_currency_by_currency_type = (type: "FIAT" | "CRYPTO") =>
      can_withdraw_currencies.find((o: { currency_type: string }) => o?.currency_type === type);

    /**
     * 币种类型 & 结算币 查找币种
     * @param type
     */
    const find_default_currency_by_currency_type = (type: "FIAT" | "CRYPTO") => {
      const default_currency = can_withdraw_currencies.find((o: {
        is_default: any;
        currency_type: string
      }) => o?.is_default && o?.currency_type === type);
      return default_currency ?? find_currency_by_currency_type(type);
    };

    // 用户当前的结算币 is_default
    const current_settlement_currency = can_withdraw_currencies.find((o: { is_default: boolean }) => o?.is_default);

    // ⚠️新用户注册的账号默认的结算币可能不在我们支持的结算币列表之中，此时需要设置默认值
    if (!current_settlement_currency) {
      console.info(find_currency_by_currency_type("FIAT"));
      setWithdrawFiat({ currency: find_currency_by_currency_type("FIAT") });

      setWithdrawCrypto({ currency: find_currency_by_currency_type("CRYPTO") });

      // 设置Tab选中 Crypto or Fiat 组件
      setWithdrawType("fiat");

      return; // ‼️‼️‼️
    }

    let the_chosen_one = current_settlement_currency;

    // 对等U价值最高的代币
    const most_valuable_currency = balances[0];

    if (most_valuable_currency?.equivalentU > 0) {
      /**
       *  查找结算币余额
       *
       *  如果结算币是法币 -》 没钱 -》寻找有钱的加密 -》
       *                           加密有钱 -》 默认加密
       *                           加密没钱 -》 默认结算币
       *  如果结算币是加密 -》 没钱 -》寻找有钱的法币
       *                           法币有钱 -》 默认法币
       *                           法币没钱 -》 默认结算币
       */
      const target_currency_balance = balances.find((o) => o?.token === current_settlement_currency?.currency);

      if (target_currency_balance?.equivalentU === 0) {
        const currency_opposite_type = current_settlement_currency?.currency_type === "FIAT" ? "CRYPTO" : "FIAT";

        const which_currency_set = new Set(
          can_withdraw_currencies
            .filter((o: { currency_type: string }) => o?.currency_type === currency_opposite_type)
            .map((o: { currency: string }) => o?.currency)
        );

        const target_currency = balances.find((b) => which_currency_set.has(b?.token));

        if (target_currency && target_currency?.equivalentU > 0) {
          the_chosen_one = can_withdraw_currencies.find((o: {
            currency: string
          }) => o?.currency === target_currency?.token) ?? current_settlement_currency;
        }
      }
    }

    // 根据 币种类型 设置Tab选中 Crypto or Fiat 组件
    setWithdrawType(the_chosen_one?.currency_type === "FIAT" ? "fiat" : "crypto");

    if (the_chosen_one?.currency_type === "FIAT") {
      // 当匹配到了法币货币的时候，需要给加密货币也给一个默认币种
      const DEFAULT_CRYPTO = find_default_currency_by_currency_type("CRYPTO");
      setWithdrawFiat({ currency: the_chosen_one });
      setWithdrawCrypto({ currency: DEFAULT_CRYPTO });
    }

    if (the_chosen_one?.currency_type === "CRYPTO") {
      // 当匹配到了加密货币的时候，需要给法币也给一个默认币种
      const DEFAULT_FIAT = find_default_currency_by_currency_type("FIAT");
      setWithdrawFiat({ currency: DEFAULT_FIAT });
      setWithdrawCrypto({ currency: the_chosen_one });

      console.info(DEFAULT_FIAT);
    }

    // balances?.length 让 useEffect 少跑：依赖项更稳定
  }, [balances?.length, currencies]);
};

/*******************************/
/*******************************/
/*******************************/

// TODO: 彩金购买
export const useSupportedBonusSwapFromCurrenciesFilter = () => {
  // 按照U的价值排好序的数据
  const { balances } = useAllAvailableBalance();

  const { data: currencies, isLoading } = useSupportedCurrencyV2();

  return useMemo(() => {
    const output: Record<string, any>[] = [];
    const transform = currencies?.data ?? [];
    balances.forEach((item: Record<string, any>) => {
      // if (item.equivalentU > 0 && item?.token !== EBonus.TOKEN) {
      // TODO: 目前彩金币种只有: BONUS SPORT
      if (item?.token !== EBonus.TOKEN && item?.token !== ESport.TOKEN) {
        const target = transform.find((o: Record<string, any>) => o.currency === item?.token);
        target && output.push({ ...target, ...item });
      }
    });

    return [
      isLoading,
      output,
      output.filter((item) => item?.balance > 0).map((item) => {
        return ({
          id: item.currency,
          value: item.currency,
          label: item.display_name,
          extra: numericFormatFun(item?.balance || 0, item?.decimal),
          icon: item.icon || `/icons/currency/${item?.currency?.toLowerCase()}.png`
        });
      })
    ] as [boolean, Record<string, any>[], Record<string, any>[]]; // 返回 [原始数据, 处理后的数据]
  }, [isLoading, balances, currencies]);
};

// TODO: 普通彩金购买币种处理
export const useBonusSwapSelectedFirstTime = () => {
  // from data store, share common data
  const { setBonusSwapTo, setBonusSwapFrom, bonusSwapFrom } = useBoundStore();

  // prevent re-initialization in the same mount
  const initFromRef = useRef(false);

  // 支持swap from的币种
  const [, swap_from_currencies] = useSupportedBonusSwapFromCurrenciesFilter();

  // 支持swap to的币种
  const { data: swap_to_currencies } = useSupportedCurrencyV2();

  // 设置默认的 swap to = BONUS
  useEffect(() => {
    if (swap_to_currencies?.data?.length === 0) return;

    const currency = (swap_to_currencies?.data ?? []).find((o: { currency: string }) => o?.currency === EBonus.TOKEN);

    setBonusSwapTo({ currency });
  }, [swap_to_currencies]);

  // 设置默认的 swap from
  useEffect(() => {
    if (swap_from_currencies?.length === 0) return;

    if (bonusSwapFrom.currency) return;

    if (initFromRef.current) return;

    initFromRef.current = true;

    setBonusSwapFrom({ currency: swap_from_currencies[0] });
  }, [bonusSwapFrom.currency, swap_from_currencies?.length]);
};

// TODO: 体育彩金购买币种处理
export const useSportSwapSelectedFirstTime = () => {
  // from data store, share common data
  const { setBonusSwapTo, setBonusSwapFrom, bonusSwapFrom } = useBoundStore();

  // prevent re-initialization in the same mount
  const initFromRef = useRef(false);

  // 支持swap from的币种
  const [, swap_from_currencies] = useSupportedBonusSwapFromCurrenciesFilter();

  // 支持swap to的币种
  const { data: swap_to_currencies } = useSupportedCurrencyV2();

  // 设置默认的 swap to = SPORT
  useEffect(() => {
    if (swap_to_currencies?.data?.length === 0) return;

    const currency = (swap_to_currencies?.data ?? []).find((o: { currency: string }) => o?.currency === ESport.TOKEN);

    setBonusSwapTo({ currency });
  }, [swap_to_currencies]);

  // 设置默认的 swap from
  useEffect(() => {
    if (swap_from_currencies?.length === 0) {
      // TODO: 防止用户切换账号时候导致一些数据污染
      setBonusSwapFrom({ currency: undefined });
      return;
    }

    if (bonusSwapFrom.currency) return;

    if (initFromRef.current) return;

    initFromRef.current = true;

    setBonusSwapFrom({ currency: swap_from_currencies[0] });
  }, [bonusSwapFrom.currency, swap_from_currencies?.length]);
};

/**
 * 兑换
 *
 * 条件：
 * from: BUCK优先级最高
 * to:   用户选择的结算币种
 */
export const useSwapCurrencySelectedFirstTime = () => {
  // from data store, share common data
  const { setSwapTo, setSwapFrom, swapFrom } = useBoundStore();

  // prevent re-initialization in the same mount
  const initFromRef = useRef(false);

  // 支持swap from的币种
  const [, swap_from_currencies] = useSupportedSwapFromCurrenciesFilter();

  // 支持swap to的币种
  const [, swap_to_currencies] = useSupportedSwapToCurrenciesFilter(swapFrom.currency);

  // 设置默认的 swap to
  useEffect(() => {
    if (swap_to_currencies?.length === 0) return;

    const currency = swap_to_currencies.find((o: { is_default: boolean }) => o?.is_default) ?? swap_to_currencies[0];

    setSwapTo({ currency });
  }, [swap_to_currencies]);

  // 设置默认的 swap from = BUCK
  useEffect(() => {
    if (swap_from_currencies?.length === 0) return;

    if (swapFrom.currency) return;

    if (initFromRef.current) return;

    // 平台币 BUCK - 最高优先级
    const platform_currency = swap_from_currencies.find((o: {
      currency: string
    }) => "BUCK" === o?.currency) ?? swap_from_currencies[0];

    initFromRef.current = true;

    setSwapFrom({ currency: platform_currency });
  }, [swapFrom.currency, swap_from_currencies?.length]);

  // 支持用户指定的兑换代币默认选中
  useEffect(() => {
    if (swap_from_currencies?.length === 0) return;

    const sub = emitter.addListener("SWAP", (currency: string) => {
      const target_currency = swap_from_currencies.find((o: { currency: string }) => currency === o?.currency);
      if (target_currency) setSwapFrom({ currency: target_currency });
    });

    return () => sub.remove();
  }, [swap_from_currencies?.length]);
};

export function randomString() {
  const timestamp = Date.now();
  const random = Math.random().toString(16).slice(2, 8);
  return `${timestamp}-${random}`;
}

// TODO: special_offer_thursday 只针对周四加密货币
export const not_fiat_currency_deposit_activity_set = new Set([promoKey.thursday()]);

export const open_debug = false;

export const debug_target: "DEPOSIT" | "WITHDRAW" | "SWAP" = "WITHDRAW";
