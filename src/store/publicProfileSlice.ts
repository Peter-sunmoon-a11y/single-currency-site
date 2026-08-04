import { IPublicProfileKeys, IPublicProfileSlice } from "@/store/type.ts";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePublicProfileStore = create<IPublicProfileSlice>()(
  persist(
    (set, get) => ({
      publicProfile: {
        HideAllProfileInfo: false,
        HideStatistics: false,
        HideTop3Games: false,
        HideAchievements: false,
        HideTournamentRewards: false,
        DoNOTReceivePromotionalOffers: false,
        DoNotPushNotifications: false,
      },
      setPublicProfile: (params: Partial<IPublicProfileKeys>) => set({ publicProfile: { ...get().publicProfile, ...params } }),
    }),
    {
      name: "public-profile",
    },
  ),
);
