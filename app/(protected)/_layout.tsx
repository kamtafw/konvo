import { Stack } from "expo-router"

export default function ProtectedLayout() {
	// const authState = useAuth()

	// if (!authState.isReady) return null

	// if (!authState.isLoggedIn) return <Redirect href="/login" />

	return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="chat/[id]" />
		</Stack>
	)
}
