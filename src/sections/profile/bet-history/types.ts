export interface BetHistoryFiltersState {
  game: string;
  asset: string;
  period: "Past 24 Hours" | "Past 7 Days" | "Past 30 Days";
}

export interface BetHistoryPageMetadata {
  currentPage: number;
  totalPages?: number;
}
