import { useProfileForm } from "@/hooks/useProfileForm"
import { useTheme } from "@/providers/ThemeProvider"
import { useProfileStore } from "@/stores/profileStore"
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons"
import clsx from "clsx"
import * as ImagePicker from "expo-image-picker"
import { Stack, useNavigation } from "expo-router"
import { cssInterop } from "nativewind"
import {
	ActivityIndicator,
	Alert,
	Image,
	Keyboard,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

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

const Title = () => {
	return (
		<View className="flex-row items-center">
			<Text className="text-xl text-onSurface font-bold">Edit Profile</Text>
		</View>
	)
}

const LabeledInput = ({ label, icon, error, ...props }: any) => (
	<View className="mb-4">
		<Text className="text-lg text-onSurface ml-3 mb-1">{label}</Text>
		<View className="flex-row items-center bg-surface px-4 py-3 gap-2 rounded-xl">
			<Feather name={icon} size={20} className="text-muted" />
			<TextInput className="flex-1 text-base text-onSurface placeholder:text-muted" {...props} />
			{error && <Text className="text-xs text-error">{error}</Text>}
		</View>
	</View>
)

const Avatar = ({ uri, onPress }: { uri?: string; onPress?: () => void }) => {
	return (
		<TouchableOpacity className="w-28 h-28" activeOpacity={0.8} onPress={onPress}>
			<Image
				className={clsx("w-28 h-28 rounded-full", !uri && "bg-primary")}
				source={uri ? { uri } : require("../../../assets/images/avatar.png")}
				resizeMode="cover"
			/>
			<View className="absolute p-1.5 rounded-full bg-surface elevation-sm right-1.5 bottom-1.5">
				<MaterialIcons name="photo-camera" size={18} className="text-onSurface" />
			</View>
		</TouchableOpacity>
	)
}

const EditProfile = () => {
	const { top } = useSafeAreaInsets()
	const { theme } = useTheme()
	const navigation = useNavigation()

	const profile = useProfileStore((state) => state.profile)
	const loading = useProfileStore((state) => state.loading)
	const updateAvatar = useProfileStore((state) => state.updateAvatar)
	const updateProfile = useProfileStore((state) => state.updateProfile)

	const { form, errors, updateField, validateAll } = useProfileForm(profile)

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
				Alert.alert("Avatar updated")
			} catch (e: any) {
				Alert.alert("Upload failed", e.message)
			}
		}
	}

	const handleSubmit = async () => {
		Keyboard.dismiss()

		if (!validateAll()) return

		try {
			await updateProfile(form)
			Alert.alert("Profile updated.")
			navigation.goBack()
		} catch (e: any) {
			Alert.alert("Update failed", e.message)
		}
	}

	return (
		<>
			<Stack.Screen
				options={{
					title: "Edit Profile",
					headerTitleAlign: "center",

					headerStyle: {
						backgroundColor: theme === "dark" ? "#0f172a" : "#f9fafb",
						borderBottomWidth: 0.5,
						borderBottomColor: theme === "dark" ? "#334155" : "#e5e7eb",
						height: 60 + top,
						paddingTop: top,
					},
					headerTitle: () => <Title />,
					headerTintColor: theme === "dark" ? "#e5e7eb" : "#334155",
				}}
			/>
			<SafeAreaView className="flex-1 bg-background" edges={["left", "right", "bottom"]}>
				<ScrollView className="flex-1 px-4 pt-6" keyboardShouldPersistTaps="handled">
					<View className="items-center">
						{/* <Avatar uri={profile?.avatar_url} onPress={pickAvatar} /> */}
					</View>

					<View className="h-4" />

					{/* NAME */}
					<LabeledInput
						icon="user"
						label="Name"
						placeholder="Paul"
						value={form.name}
						onChangeText={(t: string) => updateField("name", t)}
						error={errors.name}
					/>
					{/* PHONE */}
					<LabeledInput
						icon="phone"
						label="Phone"
						value={form.phone}
						onChangeText={(t: string) => updateField("phone", t)}
						editable={false}
					/>
					{/* EMAIL */}
					<LabeledInput
						icon="mail"
						label="Email"
						placeholder="paul@konvo.com"
						value={form.email}
						onChangeText={(t: string) => updateField("email", t)}
						error={errors.email}
					/>
					{/* BIO */}
					<LabeledInput
						icon="file-text"
						label="Bio"
						placeholder="This is me on Konvo!"
						value={form.bio}
						onChangeText={(t: string) => updateField("bio", t)}
						error={errors.email}
					/>
					{/* WEBSITE */}
					<LabeledInput
						icon="globe"
						label="Website"
						placeholder="www.my-website.com"
						value={form.website}
						onChangeText={(t: string) => updateField("website", t)}
						error={errors.website}
					/>
					{/* GITHUB */}
					<LabeledInput
						icon="github"
						label="Github"
						placeholder="github.com/paul"
						value={form.github}
						onChangeText={(t: string) => updateField("github", t)}
						error={errors.github}
					/>

					<TouchableOpacity
						// className="mt-3 bg-primary py-3.5 px-4 rounded-xl items-center"
						style={{
							backgroundColor: "#4e46e5",
							marginTop: 12,
							paddingHorizontal: 16,
							paddingVertical: 16,
							borderRadius: 12,
							alignItems: "center",
						}}
						onPress={handleSubmit}
					>
						{loading ? (
							<ActivityIndicator className="color-onPrimary" />
						) : (
							<Text className="font-bold text-base text-onPrimary">Save Changes</Text>
						)}
					</TouchableOpacity>
				</ScrollView>
			</SafeAreaView>
		</>
	)
}

export default EditProfile
