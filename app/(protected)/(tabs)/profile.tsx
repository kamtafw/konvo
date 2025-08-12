import ThemeToggle from "@/components/ThemeToggle"
import { useTheme } from "@/providers/ThemeProvider"
import { useAuthStore } from "@/stores/authStore"
import { Feather, Ionicons } from "@expo/vector-icons"
import clsx from "clsx"
import { cssInterop } from "nativewind"
import { useState } from "react"
import { Image, Linking, Pressable, ScrollView, Switch, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

cssInterop(Ionicons, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

cssInterop(Feather, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

const InfoRow = ({ icon, label, value, link, last = false }: any) => {
	return (
		<Pressable
			onPress={() => link && Linking.openURL(link)}
			className={clsx("px-4 py-3 flex-row items-center border-border gap-4", !last && "border-b")}
			style={({ pressed }) => [pressed && { opacity: 0.6 }]}
		>
			<Feather name={icon} size={18} className="text-muted" />
			<Text className="flex-1 text-sm text-textSecondary">{label}</Text>
			<Text className="text-sm text-textPrimary">{value}</Text>
		</Pressable>
	)
}

const Profile = () => {
	const mock = {
		name: "Coffeestories",
		email: "mark.brock@icloud.com",
		avatar: "https://i.imgur.com/0y8Ftya.png",
		storesCount: 2,
	}
	const [notifications, setNotifications] = useState(true)
	const { theme } = useTheme()
	const logout = useAuthStore((state) => state.logout)
	const user = useAuthStore((state) => state.user)

	if (!user) {
		return null
	}

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["left", "right"]}>
			<ScrollView className="flex-1 px-4 pt-6">
				<View className="items-center">
					<Image source={{ uri: mock.avatar }} className="w-24 h-24 rounded-full" />
					<Text className="text-xl font-bold mt-3 text-onSurface">{user.name}</Text>
					<Text className="text-sm text-onSurface">{user.bio}</Text>

					<Pressable className="mt-3 bg-primary px-5 py-2 rounded-[100px]">
						<Text className="font-medium text-sm text-onSurface">Edit profile</Text>
					</Pressable>
				</View>

				<View className="mb-5">
					<Text className="ml-5 mb-1.5 text-sm text-muted font-semibold">Information</Text>
					<View className="p-3 rounded-xl bg-surface">
						<InfoRow icon="phone" label="Phone" value={user.phone} link={`tel:${user.phone}`} />
						<InfoRow icon="mail" label="Email" value={user.email} link={`mailto:${user.email}`} />
						<InfoRow
							icon="globe"
							label="Website"
							value="www.Arnoldy.com"
							link="https://www.arnoldy.com"
						/>
						<InfoRow icon="calendar" label="Joined" value="26 March, 2023" last={true} />
					</View>
				</View>

				{/* Preferences */}
				<View>
					<Text className="ml-5 mb-1.5 text-sm font-semibold text-muted">Preferences</Text>
					<View className="p-3 rounded-xl mt-1 bg-surface">
						<View className="px-4 py-3 flex-row items-center border-b border-border gap-4">
							<Ionicons name="notifications-outline" size={18} className="text-muted" />
							<Text className="flex-1 text-sm text-textSecondary">Push notifications</Text>
							<Switch
								value={notifications}
								onValueChange={setNotifications}
								trackColor={{ false: "#9ca3af", true: "#6366f1" }}
								style={{
									marginVertical: -12,
									transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
								}}
							/>
						</View>
						<View className="p-4 flex-row items-center border-b border-border gap-4">
							<Ionicons
								name={theme === "light" ? "sunny-outline" : "moon"}
								size={18}
								className="text-muted"
							/>
							<Text className="flex-1 text-sm text-textSecondary">
								{theme === "light" ? "Light mode" : "Dark mode"}
							</Text>
							<ThemeToggle />
						</View>

						{/*<Pressable className="px-4 py-3 flex-row items-center border-b border-zinc-500 gap-4">*/}
						{/*    <FontAwesome5 name="lock" size={18} color="#333"/>*/}
						{/*    <Text className="flex-1 text-sm">PIN Code</Text>*/}
						{/*    <Ionicons*/}
						{/*        name="chevron-forward"*/}
						{/*        size={20}*/}
						{/*        color="#888"*/}
						{/*        className="-ml-1"*/}
						{/*    />*/}
						{/*</Pressable>*/}

						<Pressable className="px-4 py-3 flex-row items-center gap-4" onPress={logout}>
							<Ionicons name="log-out-outline" size={18} className="text-error" />
							<Text className="flex-1 text-sm text-error">Logout</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

export default Profile
