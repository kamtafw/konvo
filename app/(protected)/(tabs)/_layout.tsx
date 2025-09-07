import { useTheme } from "@/providers/ThemeProvider"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const _Layout = () => {
	const { top, bottom } = useSafeAreaInsets()
	const { theme } = useTheme()

	return (
		<Tabs
			screenOptions={{
				headerTitleAlign: "center",
				headerTitleStyle: {
					fontFamily: "Montserrat",
					color: theme === "dark" ? "#fff" : "#000",
				},
				headerStyle: {
					backgroundColor: theme === "dark" ? "#0f172a" : "#f9fafb",
					borderBottomWidth: 0.5,
					borderBottomColor: theme === "dark" ? "#334155" : "#e5e7eb",
					height: 60 + top,
				},
				tabBarActiveTintColor: theme === "dark" ? "#fff" : "#4e46e5",
				tabBarStyle: {
					backgroundColor: theme === "dark" ? "#0f172a" : "#f9fafb",
					borderTopWidth: 0.5,
					borderTopColor: theme === "dark" ? "#334155" : "#e5e7eb",
					height: 60 + bottom,
					paddingBottom: bottom,
				},
				tabBarLabelStyle: { fontSize: 10 },
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Chats",
					tabBarIcon: ({ focused, color }) => (
						<Ionicons
							name={focused ? "chatbubbles-sharp" : "chatbubbles-outline"}
							size={focused ? 28 : 20}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="community"
				options={{
					title: "Community",

					tabBarIcon: ({ focused, color }) => (
						<Ionicons
							name={focused ? "people-sharp" : "people-outline"}
							size={focused ? 28 : 20}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ focused, color }) => (
						<Ionicons
							name={focused ? "person-circle-sharp" : "person-circle-outline"}
							size={focused ? 28 : 20}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	)
}

export default _Layout
