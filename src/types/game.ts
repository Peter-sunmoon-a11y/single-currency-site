export interface GameListItem {
  id?: string | number;
  inner_game_id: string;
  game_provider: string;
  image?: string;
  display_game_name?: string;
  game_name?: string;
  [key: string]: any;
}

export interface UserGameListParams {
  type: string;
  keyword?: string;
  providers?: string;
  sort?: string;
  lang?: string;
  limit?: number;
  page?: number;
}

export interface UserGameListResponse {
  code: number;
  data: GameListItem[] | null;
  msg?: string;
  count?: number;
}

export type ICachePaymentIcons = {
  currency_icon: string;
  fiat_icons: string[];
  fiat_icons_light?: string[];
  crypto_icons: string[];
};
