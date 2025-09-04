import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserSettings } from "../types";

interface UserSettingsStore extends UserSettings {
  setSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
}

export const useUserSettings = create<UserSettingsStore>()(
  persist(
    set => ({
      confirmWhenPlayingCard: false,
      cardHoverScale: 1.2,
      showReactionPanel: true,
      handCardSize: 120,
      communicateCardSize: 80,
      setSetting: (key, value) =>
        set(() => ({ [key]: value } as Partial<UserSettings>)),
    }),
    {
      name: "user-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

