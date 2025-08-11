import { ThemeProvider } from "@/providers/ThemeProvider"
import { useAuthStore } from "@/stores/authStore"
import { Stack } from "expo-router"
import { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import "./global.css"

const AppContent = () => {
	const user = useAuthStore((state) => state.user)
	const restoreSession = useAuthStore((state) => state.restoreSession)

	useEffect(() => {
		restoreSession()
	}, [])

	return (
		<SafeAreaProvider>
			<Stack>
				<Stack.Protected guard={user ? true : false}>
					<Stack.Screen name="(protected)" options={{ headerShown: false, animation: "none" }} />
				</Stack.Protected>
				<Stack.Protected guard={!user ? true : false}>
					<Stack.Screen name="account" options={{ headerShown: false, animation: "none" }} />
				</Stack.Protected>
			</Stack>
			<Toast />
		</SafeAreaProvider>
	)
}

export default function App() {
	return (
		<ThemeProvider>
			<AppContent />
		</ThemeProvider>
	)
}
