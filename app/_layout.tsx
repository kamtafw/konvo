import { useBootstrapApp } from "@/hooks/useBootstrapApp"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { Stack } from "expo-router"
import { ActivityIndicator, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import "./global.css"

const AppContent = () => {
	const { ready, user } = useBootstrapApp()

	if (!ready) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		)
	}

	return (
		<Stack>
			<Stack.Protected guard={!!user}>
				<Stack.Screen name="(protected)" options={{ headerShown: false, animation: "none" }} />
			</Stack.Protected>
			<Stack.Protected guard={!user}>
				<Stack.Screen name="account" options={{ headerShown: false, animation: "none" }} />
			</Stack.Protected>
		</Stack>
	)
}

export default function App() {
	return (
		<GestureHandlerRootView className="flex-1">
			<SafeAreaProvider>
				<ThemeProvider>
					<AppContent />
					<Toast />
				</ThemeProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	)
}
