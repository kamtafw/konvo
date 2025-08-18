import { Stack } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

export default function ProtectedLayout() {
	return (
		<SafeAreaView className="flex-1 bg-background" edges={["left", "right"]}>
			<Stack
				screenOptions={{
					headerShown: true,
					headerShadowVisible: false,
					gestureEnabled: true,
				}}
			>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="chat/[id]" />
				<Stack.Screen name="profile/edit" />
			</Stack>
		</SafeAreaView>
	)
}
