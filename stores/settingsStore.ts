import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type ThemeType = "light" | "dark" | "system"

type SettingsState = {
	theme: ThemeType
	pushEnabled: boolean
	setTheme: (theme: ThemeType) => void
	setPushEnabled: (enabled: boolean) => void
}

export const useSettingsStore = create(
	persist<SettingsState>(
		(set) => ({
			theme: "light", // only used until hydration finishes
			pushEnabled: true,
			setTheme: (theme) => set({ theme }),
			setPushEnabled: (enabled) => set({ pushEnabled: enabled }),
		}),
		{
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        pushEnabled: state.pushEnabled,
      }),
    }
	)
)
