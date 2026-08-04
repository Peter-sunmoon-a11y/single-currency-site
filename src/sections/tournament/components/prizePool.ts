/**
 * 锦标赛奖金池配置
 * 排名范围和对应的奖金金额
 */
export interface PrizePoolItem {
  rank: string;
  prize: number;
}

export const TOURNAMENT_PRIZE_POOL: PrizePoolItem[] = [
  { rank: "1st", prize: 22000.00 },
  { rank: "2nd", prize: 14000.00 },
  { rank: "3rd", prize: 7000.00 },
  { rank: "4th", prize: 5000.00 },
  { rank: "5th", prize: 4000.00 },
  { rank: "6th", prize: 3500.00 },
  { rank: "7th", prize: 3000.00 },
  { rank: "8th", prize: 2500.00 },
  { rank: "9th", prize: 2000.00 },
  { rank: "10th", prize: 1500.00 },
  { rank: "11th", prize: 900.00 },
  { rank: "12th", prize: 800.00 },
  { rank: "13th", prize: 700.00 },
  { rank: "14th", prize: 600.00 },
  { rank: "15th", prize: 500.00 },
  { rank: "16th", prize: 400.00 },
  { rank: "17th", prize: 350.00 },
  { rank: "18th", prize: 300.00 },
  { rank: "19th", prize: 250.00 },
  { rank: "20th", prize: 200.00 },
  { rank: "21st-50th", prize: 150.00 },
  { rank: "51st-100th", prize: 100.00 },
  { rank: "101st-200th", prize: 55.00 },
  { rank: "201st-300th", prize: 40.00 },
  { rank: "301st-400th", prize: 35.00 },
  { rank: "401st-500th", prize: 25.00 },
  { rank: "501st-600th", prize: 20.00 },
  { rank: "601st-700th", prize: 12.50 },
  { rank: "701st-800th", prize: 10.00 },
  { rank: "801st-900th", prize: 7.50 },
  { rank: "901st-1000th", prize: 5.00 }
];
