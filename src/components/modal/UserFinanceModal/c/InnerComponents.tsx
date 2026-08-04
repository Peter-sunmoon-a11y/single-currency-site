import React, { PropsWithChildren, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { cn } from "@/utils/cn.ts";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { emitter } from "@/store/emitter.ts";
import { Ban } from "lucide-react";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { useGetPromoByPage } from "@/query/promo.tsx";

export const DisplayContent = ({ children, status, className }: PropsWithChildren<{
  status: boolean,
  className?: string
}>) => {
  return <div className={clsx(status ? "block" : "hidden", className)}>{children}</div>;
};

export const FormBox = ({ label, children, className }: { label: ReactNode; children: ReactNode, className?: string }) => {
  return (
    <div className={clsx('flex flex-col gap-2 flex-1', className)}>
      <div className="text-sm font-semibold text-base-content/50">{label}</div>
      {children}
    </div>
  );
};

export const InputBox = ({ type, ignore, detect, label, className, ...props }: React.ComponentProps<"input"> & {
  label: React.ReactNode
  ignore?: boolean
  detect?: Record<string, any>
}) => {
  const passed = useMemo(() => {
    if (ignore) return false;
    return detect?.value?.trim() !== "" && !detect?.error;
  }, [detect, ignore]);

  return (
    <FormBox label={label}>
      <div className="relative flex items-center">
        <input
          {...props}
          className={clsx("bg-base-200 input w-full border-0 !outline-0 px-4", className)} />
        {!ignore && passed &&
          <span className="text-[12px] absolute right-2 z-1 text-success leading-none">✓</span>}
      </div>
    </FormBox>
  );
};

// 服务于必填项
export const InnerFieldItem = ({ name, field, onChange }: {
  name: string,
  field: Record<string, any>,
  onChange: (v: Record<string, any>) => void
}) => {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { t } = useTranslation();

  const [account, setAccount] = useState<{
    value: string
    error: boolean
    error_content: Record<string, any> | null
  }>({
    value: "",
    error: false,
    error_content: null
  });

  const regexp = useMemo(() => {
    if (field?.label === "email") {
      return { error: "EMAIL", regexp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ };
    }

    if (field?.type === "number") {
      // 有几个固定长度的要求
      if (field?.fixed_length) {
        const split = field?.fixed_length?.split(",");
        const combine = split.map((s: string) => `^\\d{${s}}$`);
        return {
          error: "NUMBER_LIMIT_LENGTH",
          regexp: new RegExp(combine.join("|")),
          limit: field?.fixed_length
        };
      }
      // 有最短长度要求，有最大长度要求
      if (field?.min_length > 0 && field?.max_length > 0 && field?.min_length !== field?.max_length) {
        return {
          error: "MIN_MAX_LENGTH",
          regexp: new RegExp(`^\\d{${field.min_length},${field.max_length}}$`),
          min: field.min_length,
          max: field.max_length,
          mobile: field.label === "mobile_number"
        };
      }
      // 固定长度要求
      if (field?.min_length > 0 && field?.max_length > 0 && field?.min_length === field?.max_length) {
        return {
          error: "FIXED_LENGTH",
          regexp: new RegExp(`^\\d{${field.min_length}}$`),
          len: field.min_length,
          mobile: field.label === "mobile_number"
        };
      }
      // 有些没有长度要求，需要自行控制
      if (field.label === "mobile_number") {
        return {
          error: "MIN_MAX_LENGTH",
          regexp: /^[0-9]{7,15}$/,
          min: 7,
          max: 15,
          mobile: true
        };
      }

      // 至少1位数字
      return { error: "REQUIRED_NUMBER", regexp: /^\d+$/ };
    }

    if (field?.type === "string") {
      // 有几个固定长度的要求
      if (field?.fixed_length) {
        const split = field?.fixed_length?.split(",");
        const combine = split.map((s: string) => `^.{${s}}$`);
        return {
          error: "STRING_LIMIT_LENGTH",
          regexp: new RegExp(combine.join("|")),
          limit: field?.fixed_length
        };
      }
      // 有最短长度要求，有最大长度要求
      if (field?.min_length > 0 && field?.max_length > 0 && field?.min_length !== field?.max_length) {
        return {
          error: "STRING_MIN_MAX_LENGTH",
          regexp: new RegExp(`^.{${field.min_length},${field.max_length}}$`),
          min: field.min_length,
          max: field.max_length
        };
      }
      // 固定长度要求
      if (field?.min_length > 0 && field?.max_length > 0 && field?.min_length === field?.max_length) {
        return {
          error: "STRING_FIXED_LENGTH",
          regexp: new RegExp(`^.{${field.min_length}}$`),
          len: field.min_length
        };
      }
      // 有最短长度要求
      if (field?.min_length > 0) {
        return {
          error: "STRING_MIN_LENGTH",
          regexp: new RegExp(`^.{${field.min_length},}$`),
          len: field.min_length
        };
      }

      // 特殊字符禁止要求 - 单个限制
      if (field?.enonly) {
        // 限制只能输入英文字母,数字,空格
        return {
          error: "STRING_EN_ONLY",
          regexp: /^(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ]+$/
        };
      }

      // 特殊字符禁止要求 - 单个限制
      if (field?.disabled_char) {
        return {
          error: "STRING_DISABLED_CHAR",
          regexp: new RegExp(`^(?!\\s*$)[^${field.disabled_char.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}]*$`),
          disabled_char: field?.disabled_char
        };
      }
    }

    // 非空即可
    return { error: "REQUIRED_FIELDS", regexp: /^(?=\s*\S)[\s\S]*$/ };
  }, [field]);

  const debouncedChange = (v: Record<string, any>) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onChange(v);
    }, 300);
  };

  const cancelDebounce = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  const handleResetForm = useCallback(() => {
    let final_value = "";
    if (field?.default) {
      const check_value = field?.type === "number" && Number(field?.default) === 0;
      final_value = check_value ? "" : field?.default;
    }
    setAccount({ value: final_value, error: false, error_content: null });
    onChange({ value: final_value, [`${name}_error`]: false });
    cancelDebounce();
  }, [field, name, onChange]);

  useEffect(() => {
    return () => cancelDebounce();
  }, []);

  // ‼️‼️‼️ 事件通知 & 重置表单状态‼
  useEffect(() => {
    const em = emitter.addListener("CLOSE_FINANCE_MODAL", handleResetForm);
    return () => em?.remove();
  }, [handleResetForm]);

  // 如果带了默认值则默认填充
  useEffect(() => {
    if (field?.default) handleResetForm();
  }, [field]);

  return (
    <div className={"relative"} key={name} onClick={(e) => e.stopPropagation()}>
      <InputBox
        type="text"
        label={<RequireItem label={t(`finance:${field.label}`)} required={field?.required} />}
        value={account.value}
        detect={account}
        onChange={(e) => {
          // TODO: 当姓名有值的时候禁止用户修改姓名
          if (name === "name" && field?.default !== "" && field?.required) return;

          const base = {
            value: e.target.value,
            error: !regexp.regexp.test(e.target.value),
            error_content: !regexp.regexp.test(e.target.value) ? regexp : null
          };
          setAccount((old) => ({ ...old, ...base }));
          debouncedChange({ value: base.value, [`${name}_error`]: base.error });
        }}
        // TODO: 当姓名有值的时候禁止用户修改姓名
        readOnly={name === "name" && field?.default !== "" && field?.required}
        placeholder={`${t("finance:enter")} ${t(`finance:${field.label}`)}`}
      />
      {/* 有长度范围的手机号 */}
      <ErrorMessageBox
        show={account.error_content?.error === "MIN_MAX_LENGTH" && account.error_content?.mobile}
        content={t("finance:enter_phone_min_max", { min: account.error_content?.min, max: account.error_content?.max })}
      />
      {/* 固定长度的手机号 */}
      <ErrorMessageBox
        show={account.error_content?.error === "FIXED_LENGTH" && account.error_content?.mobile}
        content={t("finance:enter_phone_fixed_len", { len: account.error_content?.len })}
      />
      <ErrorMessageBox
        show={account.error_content?.error === "EMAIL"}
        content={t("finance:enter_email_correct")}
      />
      <ErrorMessageBox
        show={account.error_content?.error === "REQUIRED_FIELDS"}
        content={t("finance:field_required")}
      />
      <ErrorMessageBox
        show={account.error_content?.error === "REQUIRED_NUMBER"}
        content={t("finance:enter_number")}
      />
      {/* 有长度范围的数字账号 */}
      <ErrorMessageBox
        show={account.error_content?.error === "MIN_MAX_LENGTH" && !account.error_content?.mobile}
        content={t("finance:enter_number_min_max", {
          min: account.error_content?.min,
          max: account.error_content?.max
        })}
      />
      {/* 固定长度的数字账号 */}
      <ErrorMessageBox
        show={account.error_content?.error === "FIXED_LENGTH" && !account.error_content?.mobile}
        content={t("finance:enter_number_fixed_len", { len: account.error_content?.len })}
      />
      <ErrorMessageBox
        content={t("finance:enter_code_fixed_len", { len: account.error_content?.len })}
        show={account.error_content?.error === "STRING_FIXED_LENGTH"}
      />
      <ErrorMessageBox
        show={account.error_content?.error === "STRING_MIN_MAX_LENGTH" && !account.error_content?.mobile}
        content={t("finance:enter_code_min_max", { min: account.error_content?.min, max: account.error_content?.max })}
      />
      {/* 特殊字符禁止要求 */}
      <ErrorMessageBox
        show={account.error_content?.error === "STRING_DISABLED_CHAR"}
        content={t("finance:enter_string_disabled_char", { char: account.error_content?.disabled_char })}
      />
      {/* 有几个固定长度要求 */}
      <ErrorMessageBox
        show={account.error_content?.error === "NUMBER_LIMIT_LENGTH"}
        content={t("finance:enter_number_limit_length", { limit: account.error_content?.limit })}
      />
      <ErrorMessageBox
        show={account.error_content?.error === "STRING_LIMIT_LENGTH"}
        content={t("finance:enter_string_limit_length", { limit: account.error_content?.limit })}
      />
      <ErrorMessageBox
        show={account.error_content?.error === "STRING_MIN_LENGTH"}
        content={t("finance:enter_string_min_length", `The length must be at least ${account.error_content?.len}.`, { length: account.error_content?.len })}
      />
      <ErrorMessageBox
        show={account.error_content?.error === "STRING_EN_ONLY"}
        content={t("finance:enter_string_en_only", `Only English letters, numbers, and spaces can be entered.`)}
      />
      <ErrorMessageBox
        show={account.error_content?.error === "STRING_EN_ONLY_AND_DISABLED_CHAR"}
        content={t("finance:enter_string_disabled_char", { char: account.error_content?.disabled_char })}
      />
    </div>
  );
};

// 服务于非必填项
export const InnerUnnecessary = ({ name, field, onChange }: {
  name: string,
  field: Record<string, any>,
  onChange: (v: Record<string, any>) => void
}) => {
  const { t } = useTranslation();

  const [value, setValue] = useState<string>("");

  useEffect(() => {
    const em = emitter.addListener("CLOSE_FINANCE_MODAL", function() {
      setValue("");
      onChange({ value: "" });
    });

    return () => em?.remove();
  }, [name, onChange]);

  return (
    <div key={name} onClick={(e) => e.stopPropagation()}>
      <InputBox
        ignore
        type="text"
        label={<RequireItem label={t(`finance:${field.label}`)} />}
        value={value}
        onChange={(e) => {
          const value = e.target.value;
          setValue(value);
          onChange({ value });
        }}
        placeholder={`${t("finance:enter")} ${t(`finance:${field.label}`)}`}
      />
    </div>
  );
};

export const InnerOptions = ({ name, field, onChange }: {
  name: string,
  field: Record<string, any>,
  onChange: (v: Record<string, any>) => void
}) => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<{
    value: string,
  }>({
    value: ""
  });

  const memoOptions = useMemo(() => {
    return field.select.map((item: Record<string, any>) => ({
      id: item.value,
      value: item.value,
      label: item.key
    }));
  }, [field]);

  useEffect(() => {
    const required = field?.required;
    const defaultValue = field?.default;
    const defaultOption = defaultValue
      ? memoOptions.find((o: Record<string, any>) => o.value === defaultValue)
      : "";

    onChange({ value: defaultOption?.value ?? "", [`${name}_error`]: !!(required && defaultOption === "") });
    setStatus((old) => ({ ...old, value: defaultOption?.value ?? "" }));
  }, [memoOptions, field?.default]);

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置表单状态
  useEffect(() => {
    const events = ["CLOSE_FINANCE_MODAL"];
    const subs = events.map((eventName) =>
      emitter.addListener(eventName, () => {
        setStatus((old) => ({ ...old, value: "" }));
      })
    );
    return () => {
      subs.forEach((sub) => sub.remove());
    };
  }, []);

  return (<FormBox key={name} label={<RequireItem required={field?.required} label={t(`finance:${field.label}`)} />}>
    <SelectDropdown
      title={t(`finance:${field.label}`)}
      options={memoOptions}
      value={status.value}
      onChange={(value) => {
        onChange({ value: value, [`${name}_error`]: false });
        setStatus((old) => ({ ...old, value: value as string }));
      }}
      renderOption={(option: Record<string, any>) => {
        return <p className="text-sm font-bold">{option.label || option.value}</p>;
      }}
    />
  </FormBox>);
};

export const InnerPayment = ({ method, gateway, onClick }: {
  method: Record<string, any> | null,
  gateway: Record<string, any>,
  onClick: (e: React.MouseEvent) => void
}) => {
  const isSelected = method?.id === gateway?.id;
  return (<button
    className={clsx(
      "px-2 h-8 btn btn-primary btn-soft text-base-content relative overflow-visible",
      { "text-primary": isSelected }
    )}
    onClick={onClick}
  >
    <InnerMaintenance show={gateway?.status === 0} className="top-0 left-0 right-0" />
    <p className="truncate">{gateway?.display_name || gateway?.channel_class}</p>
    {isSelected && (
      <span className="absolute bottom-0 right-0 w-0 h-0 border-b-[18px] border-l-[18px] border-b-primary border-l-transparent rounded-br-[inherit]" />
    )}
  </button>);
};

export const InnerProviderAmountRangeFormat = ({ min, max, currency = "" }: {
  min: string,
  max: string,
  currency?: string
}) => {
  const o = (value: string, decimal = 18): string => {
    const str = String(value);
    const _value = str.indexOf(".") > -1 ? f(str, decimal) : str;
    return _value.replace(/\d+/, (m) => m.replace(/(\d)(?=(\d{3})+$)/g, ($1) => $1 + ","));
  };

  const f = (value: string, decimal = 18): string => {
    const regexp = /(?:\.0*|(\.\d+?)0+)$/;
    const [a, b] = value.split(".");
    const output = `${a}.${b.substring(0, decimal)}`;
    return output.replace(regexp, "$1");
  };

  return <span className={'text-sm'}>
    {o(min)}~{o(max)}{" "}{currency}
  </span>;
};

// 维护中的供应商
export const InnerMaintenance = ({ show, className }: { show: boolean, className?: string }) => {
  return show && (
    <span
      className={clsx("absolute truncate w-full h-full flex items-center justify-center gap-1", className)}
    >
      <Ban size={30} className="text-error shrink-0" />
    </span>
  );
};

export const InnerProviderIcon = (
  {
    icon,
    thumbnail,
    iconLight,
    thumbnailLight
  }: {
    icon?: string;
    thumbnail?: string;
    iconLight?: string;
    thumbnailLight?: string;
  }) => {
  const isDarkTheme = () => document.documentElement.getAttribute("data-theme") !== "light";
  const isDark = isDarkTheme();

  const effectiveThumbnail = isDark ? thumbnail : (thumbnailLight ?? thumbnail);
  const effectiveIcon = isDark ? icon : (iconLight ?? icon);

  const src = effectiveThumbnail || effectiveIcon;
  if (!src) return null;

  return <img src={src} className={clsx("rounded-sm max-h-6")} alt="" loading="lazy" />;
};

export const ImageWithPlaceholder = ({ src, alt, className, ...props }: React.ComponentProps<"img">) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  return <div className="w-20 h-10">
    {/* 加载中的skeleton */}
    {!imageLoaded && (
      <div className="skeleton bg-base-300 w-full rounded-lg h-full" />
    )}

    <img
      {...props}
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("h-full w-full object-contain", {
        "opacity-0": !imageLoaded,
        "opacity-100": imageLoaded,
        "transition-opacity duration-200": true
      })}
      onLoad={() => setImageLoaded(true)}
    />
  </div>;
};

export const InnerLoading = () => {
  return (
    <>
      <span className="bg-base-300 md:bg-base-400 skeleton w-6 h-6 rounded-full"></span>
      <span className="bg-base-300 md:bg-base-400 skeleton flex-1 rounded-lg h-6" />
    </>
  );
};

export const InnerRangeSlider = ({ max, step, disabled, value, onPointerUp }: {
  max: number,
  step: number;
  value?: string | number,
  disabled: boolean,
  onPointerUp: (v: string) => void
}) => {
  const valueRef = useRef<string>("0");
  const slidingRef = useRef(false);

  const [innerValue, setInnerValue] = useState<string>("0");

  useEffect(() => {
    if (slidingRef.current) return; // 互斥条件，控制权转移
    const next = String(value || "0");
    valueRef.current = next;
    setInnerValue(next);
  }, [value]);

  return <input
    type="range"
    min={0}
    max={max}
    step={step}
    value={innerValue}
    onPointerDown={() => {
      slidingRef.current = true;
    }}
    onPointerUp={() => {
      slidingRef.current = false;
      onPointerUp(valueRef.current);
    }}
    onInput={(e) => {
      const next = e.currentTarget.value;
      setInnerValue(next);
      valueRef.current = next;
    }}
    disabled={disabled}
    className="range range-xs w-full mt-6" />;
};

export const InnerErrorWrapper = ({ children }: { children: ReactNode }) => {
  return <div className="relative">{children}</div>;
};

export const InnerErrorGapWrapper = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col gap-4">{children}</div>;
};

// 优惠充值活动
export const InnerSpecialOffersWrapper = ({ children }: { mode?: string, children: ReactNode }) => {
  const { currentPromo } = useGetPromoByPage();
  return <InnerDisplayContent show={currentPromo}>
    {children}
  </InnerDisplayContent>;
};

export const InnerDepositProviderError = (
  {
    show, channel
  }: { show: boolean, channel: string }) => {
  return (
    // 通道在维护
    <InnerDisplayContent show={show}>
      <ErrorMessageBox
        sample
        className={"!mt-0 !text-sm text-center"}
        content={<Trans
          i18nKey={"finance:channel_under_maintenance"}
          values={{ channel: channel }}
          components={[<span className="underline font-bold" />]} />}
        show={show} />
    </InnerDisplayContent>);
};
