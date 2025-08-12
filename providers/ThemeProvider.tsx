import { useSettingsStore } from "@/stores/settingsStore"
import { themes } from "@/utils/color-theme"
import { StatusBar } from "expo-status-bar"
import { colorScheme } from "nativewind"
import React, { createContext, useContext, useEffect, useState } from "react"
import { useColorScheme, View } from "react-native"

interface ThemeProviderProps {
	children: React.ReactNode
}

type ThemeContextType = {
	theme: "light" | "dark"
	toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType>({
	theme: "light",
	toggleTheme: () => {},
})

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
	const systemScheme = useColorScheme()
	const [hydrated, setHydrated] = useState(false)
	const { theme: storedTheme, setTheme } = useSettingsStore()

	// initialize theme from persisted settings
	useEffect(() => {
		const loadTheme = async () => {
			await useSettingsStore.persist.rehydrate() // make sure settingsStore is loaded
			const themeToApply = storedTheme || systemScheme || "light"
			colorScheme.set(themeToApply)
			setTheme(themeToApply) // ensure store reflects the applied theme
			setHydrated(true)
		}
		loadTheme()
	}, [])

	const toggleTheme = () => {
		const newTheme = storedTheme === "light" ? "dark" : "light"
		setTheme(newTheme)
		colorScheme.set(newTheme)
	}

	// avoid rendering UI until theme is restored
	if (!hydrated) return null

	return (
		<ThemeContext.Provider value={{ theme: storedTheme as "light" | "dark", toggleTheme }}>
			<StatusBar style={storedTheme === "dark" ? "light" : "dark"} />
			<View style={themes[storedTheme]} className="flex-1">
				{children}
			</View>
		</ThemeContext.Provider>
	)
}

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider")
	}
	return context
}
