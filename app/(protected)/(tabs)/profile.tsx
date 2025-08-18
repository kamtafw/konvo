import ThemeToggle from "@/components/ThemeToggle"
import { useTheme } from "@/providers/ThemeProvider"
import { useAuthStore } from "@/stores/authStore"
import { useProfileStore } from "@/stores/profileStore"
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons"
import clsx from "clsx"
import * as ImagePicker from "expo-image-picker"
import { useNavigation } from "expo-router"
import { cssInterop } from "nativewind"
import { useEffect, useRef, useState } from "react"
import {
	Alert,
	Animated,
	Image,
	Linking,
	Pressable,
	ScrollView,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
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

cssInterop(MaterialIcons, {
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

const Avatar = ({ uri, onPress }: { uri?: string; onPress?: () => void }) => {
	const fadeAnim = useRef(new Animated.Value(1)).current
	const [displayUri, setDisplayUri] = useState(uri)

	useEffect(() => {
		if (!uri) return

		// fade out
		Animated.timing(fadeAnim, {
			toValue: 0,
			duration: 150,
			useNativeDriver: true,
		}).start(() => {
			// after fade out, update the image
			setDisplayUri(uri)
			// fade back in
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start()
		})
	}, [uri])

	return (
		<TouchableOpacity className="w-28 h-28" activeOpacity={0.8} onPress={onPress}>
			<Animated.View>
				<Image
					className={clsx("w-28 h-28 rounded-full", !uri && "bg-primary")}
					source={displayUri ? { uri: displayUri } : require("../../../assets/images/avatar.png")}
					resizeMode="cover"
				/>
			</Animated.View>
			<View className="absolute p-1.5 rounded-full bg-surface elevation-sm right-1.5 bottom-1.5">
				<MaterialIcons name="photo-camera" size={18} className="text-onSurface" />
			</View>
		</TouchableOpacity>
	)
}

const Profile = () => {
	const { theme } = useTheme()
	const navigation = useNavigation()

	const [notifications, setNotifications] = useState(false)

	const logout = useAuthStore((state) => state.logout)
	const profile = useProfileStore((state) => state.profile)
	const updateAvatar = useProfileStore((state) => state.updateAvatar)

	const pickAvatar = async () => {
		const { status, granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
		if (status !== "granted" || !granted) {
			Alert.alert("Permission needed", "We need access to your photos to update your avatar.")
			return
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
			selectionLimit: 1,
		})
		if (!result.canceled && result.assets?.[0]?.uri) {
			try {
				await updateAvatar(result.assets[0].uri)
			} catch (e: any) {
				Alert.alert("Upload failed", e.message)
			}
		}
	}

	if (!profile) {
		return null
	}

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["left", "right"]}>
			<ScrollView className="flex-1 px-4 pt-6">
				<View className="items-center">
					<Avatar uri={profile.avatar_url} onPress={pickAvatar} />
					<Text className="text-xl font-bold mt-3 text-onSurface">{profile.name}</Text>
					<Text className="text-sm text-onSurface">{profile.bio}</Text>
					{/* () => router.push(`/profile/edit`) */}
					{/* <TouchableOpacity
						className="mt-3 bg-primary px-5 py-2 rounded-[100px]"
						onPress={() => router.push(`/profile/edit`)}
					>
						<Text className="font-medium text-sm text-onPrimary">Edit profile</Text>
					</TouchableOpacity> */}
				</View>

				<View className="h-3" />

				<View className="mb-5">
					<View className="flex-row items-center justify-between mx-3 my-2">
						<Text className="text-base text-muted font-bold">Information</Text>
						<TouchableOpacity onPress={() => navigation.navigate("profile/edit" as never)}>
							{/* router.push(`/profile/edit`) */}
							<Text className="font-medium text-sm text-muted">Edit profile</Text>
						</TouchableOpacity>
					</View>
					<View className="p-3 rounded-xl bg-surface">
						{/* PHONE */}
						<InfoRow
							icon="phone"
							label="Phone"
							value={profile.phone}
							link={`tel:${profile.phone}`}
						/>

						{/* EMAIL */}
						{profile.email && (
							<InfoRow
								icon="mail"
								label="Email"
								value={profile.email}
								link={`mailto:${profile.email}`}
							/>
						)}

						{/* WEBSITE */}
						{profile.website && (
							<InfoRow
								icon="globe"
								label="Website"
								value={profile.website}
								link={`https://${profile.website}`}
							/>
						)}

						{/* GITHUB */}
						{profile.github && (
							<InfoRow
								icon="github"
								label="Github"
								value={profile.github}
								link={`https://${profile.github}`}
							/>
						)}

						{/* DATE JOINED */}
						<InfoRow
							icon="calendar"
							label="Joined"
							value={new Date(profile.date_joined).toLocaleDateString("en-UK", {
								dateStyle: "long",
							})}
							last={true}
						/>
					</View>
				</View>

				<View className="h-3" />

				{/* Preferences */}
				<View>
					<View className="flex-row items-center justify-between mx-3 my-2">
						<Text className="text-base text-muted font-bold">Preferences</Text>
					</View>
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
