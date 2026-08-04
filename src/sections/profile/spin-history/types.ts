import { FreeSpinStatus } from "@/types/freeSpins";

export type StatusFilter = "all" | FreeSpinStatus;

export interface StatusOption {
  value: StatusFilter;
  label: string;
}

export type StatusClassMap = Record<number, string>;
