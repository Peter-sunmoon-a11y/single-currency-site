export interface ITournamentInfo {
  title?: string;
  position?: number | string;
  wagered?: number | string;
  prize?: number | string;
  prizePercentage?: number | string;
  [key: string]: any;
}

export interface ITournament {
  id?: string | number;
  game_provider: string;
  end_time: number; // seconds timestamp
  user_info: ITournamentInfo | null;
  [key: string]: any;
}

export interface ITournamentTable {
  user_id: number;
  nickname?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  wagered: number | string;
  prize: number | string;
  prize_rate: number | string;
  rank?: number;
  medal?: number | string;
}

export interface TournamentPoolPrizeParams {
  tournament_id: number | string;
  tournament_level: string;
}
