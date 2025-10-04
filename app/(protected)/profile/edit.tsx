import { useProfileForm } from "@/hooks/useProfileForm"
import { useTheme } from "@/providers/ThemeProvider"
import { useProfileStore } from "@/stores/profileStore"
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Stack, useNavigation } from "expo-router"
import { cssInterop } from "nativewind"
import {
	ActivityIndicator,
	Alert,
	Dimensions,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

import { useBackToDismissKeyboard, useKeyboardHeight } from "@/hooks/useKeyboard"
import { normalizePhone } from "@/utils/validation"
import { Formik } from "formik"
import { useCallback, useEffect, useRef } from "react"
import * as Yup from "yup"

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

const EditProfile2 = () => {
	const { top } = useSafeAreaInsets()
	const { theme } = useTheme()
	const navigation = useNavigation()

	const profile = useProfileStore((state) => state.profile)
	const loading = useProfileStore((state) => state.loading)
	const updateProfile = useProfileStore((state) => state.updateProfile)

	const { form, errors, updateField, validateAll } = useProfileForm(profile)

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
						backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
						borderBottomWidth: 0.5,
						borderBottomColor: theme === "dark" ? "#334155" : "#e5e7eb",
						height: 60 + top,
						paddingTop: top,
					},
					headerTintColor: theme === "dark" ? "#e5e7eb" : "#334155",
					headerTitle: () => <Title />,
				}}
			/>
			<SafeAreaView className="flex-1 bg-background" edges={["left", "right", "bottom"]}>
				<ScrollView className="flex-1 px-4 pt-6" keyboardShouldPersistTaps="handled">
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
							backgroundColor: theme === "dark" ? "#6366f1" : "#4e46e5",
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

const validationSchema = Yup.object().shape({
	username: Yup.string()
		.matches(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed")
		.min(3, "Username too short")
		.max(20, "Username too long")
		.required("Username is required"),

	email: Yup.string().email("Invalid email address").required("Email is required"),

	bio: Yup.string().max(200, "Bio cannot be more than 200 characters").optional(),

	website: Yup.string()
		.matches(
			/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
			"Please enter a valid website URL"
		)
		.optional(),

	github: Yup.string()
		.matches(
			/^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/,
			"Please enter a valid GitHub profile URL (e.g., github.com/username)"
		)
		.optional(),
})

const EditProfile = () => {
	useBackToDismissKeyboard()
	const { isKeyboardVisible, keyboardHeight } = useKeyboardHeight()

	const { theme } = useTheme()
	const { top } = useSafeAreaInsets()
	const navigation = useNavigation()
	const scrollViewRef = useRef<ScrollView>(null)

	const profile = useProfileStore((state) => state.profile)
	const updateProfile = useProfileStore((state) => state.updateProfile)

	const initialValues = {
		username: profile?.name || "",
		phone: profile?.phone || "",
		email: profile?.email || "",
		bio: profile?.bio || "",
		website: profile?.website || "",
		github: profile?.github || "",
	}

	const handleSubmit = useCallback(
		async (values: any, { setSubmitting }: any) => {
			Keyboard.dismiss()

			const payload = {
				...values,
				phone: normalizePhone(values.phone),
				name: values.username,
			}

			try {
				await updateProfile(payload)
				Alert.alert("Profile update.")
				navigation.goBack()
			} catch (err: any) {
				Alert.alert("Update failed", err.message)
			} finally {
				setSubmitting(false)
			}
		},
		[updateProfile, navigation]
	)

	// auto-scroll when keyboard appears
	useEffect(() => {
		if (isKeyboardVisible && scrollViewRef.current) {
			setTimeout(() => {
				scrollViewRef.current?.scrollToEnd({ animated: true })
			}, 100)
		}
	}, [isKeyboardVisible])

	const handleInputFocus = useCallback(() => {}, [])

	const screenHeight = Dimensions.get("window").height

	return (
		<>
			<Stack.Screen
				options={{
					title: "Edit Profile",
					headerTitleAlign: "center",
					headerStyle: {
						backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
						borderBottomWidth: 0.5,
						borderBottomColor: theme === "dark" ? "#334155" : "#e5e7eb",
						height: 60 + top,
						paddingTop: top,
					},
					headerTintColor: theme === "dark" ? "#e5e7eb" : "#334155",
					headerTitle: () => <Title />,
				}}
			/>
			<SafeAreaView className="flex-1 bg-background">
				<KeyboardAvoidingView
					className="flex-1"
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
				>
					<ScrollView
						ref={scrollViewRef}
						className="flex-1"
						contentContainerStyle={{
							flexGrow: 1,
							paddingTop: 24,
							paddingHorizontal: 16,
							paddingBottom: isKeyboardVisible ? keyboardHeight + 40 : 0,
							minHeight: screenHeight * 0.7,
						}}
						scrollEventThrottle={16}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
						nestedScrollEnabled={true}
					>
						<Formik
							initialValues={initialValues}
							validationSchema={validationSchema}
							onSubmit={handleSubmit}
							enableReinitialize={true}
						>
							{({
								handleChange,
								handleBlur,
								handleSubmit,
								values,
								errors,
								touched,
								isSubmitting,
								isValid,
								dirty,
							}) => (
								<>
									<View>
										{/* Name */}
										<LabeledInput
											icon="user"
											label="Name"
											placeholder="Paul"
											onChangeText={handleChange("username")}
											onBlur={handleBlur("username")}
											// onFocus={() => handleInputFocus(0)}
											value={values.username}
											error={touched.username ? errors.username : null}
											editable={!isSubmitting}
										/>

										{/* Phone */}
										<LabeledInput
											icon="phone"
											label="Phone"
											value={values.phone}
											editable={false}
										/>

										{/* Email */}
										<LabeledInput
											icon="mail"
											label="Email"
											placeholder="paul@konvo.com"
											onChangeText={handleChange("email")}
											onBlur={handleBlur("email")}
											// onFocus={() => handleInputFocus(1)}
											value={values.email}
											error={touched.email ? errors.email : null}
											editable={!isSubmitting}
										/>

										{/* Bio */}
										<LabeledInput
											icon="file-text"
											label="Bio"
											placeholder="This is me on Konvo!"
											onChangeText={handleChange("bio")}
											onBlur={handleBlur("bio")}
											// onFocus={() => handleInputFocus(2)}
											value={values.bio}
											error={touched.bio ? errors.bio : null}
											editable={!isSubmitting}
										/>

										{/* Website */}
										<LabeledInput
											icon="globe"
											label="Website"
											placeholder="www.my-website.com"
											onChangeText={handleChange("website")}
											onBlur={handleBlur("website")}
											// onFocus={() => handleInputFocus(4)}
											value={values.website}
											error={touched.website ? errors.website : null}
											editable={!isSubmitting}
										/>

										{/* Github */}
										<LabeledInput
											icon="github"
											label="Github"
											placeholder="github.com/paul"
											onChangeText={handleChange("github")}
											onBlur={handleBlur("github")}
											// onFocus={() => handleInputFocus(5)}
											value={values.github}
											error={touched.github ? errors.github : null}
											editable={!isSubmitting}
										/>
									</View>

									{/* Submit Button */}
									<TouchableOpacity
										disabled={!(isValid && dirty) || isSubmitting}
										className="opacity-40"
										style={{
											backgroundColor: theme === "dark" ? "#6366f1" : "#4e46e5",
											alignItems: "center",
											borderRadius: 8,
											marginTop: 24,
											paddingVertical: 12,
											opacity: !(isValid && dirty) || isSubmitting ? 0.4 : undefined,
										}}
										onPress={handleSubmit as any}
									>
										{isSubmitting ? (
											<ActivityIndicator className="text-onSurface" />
										) : (
											<Text className="text-center text-xl text-onPrimary font-bold">
												Save Changes
											</Text>
										)}
									</TouchableOpacity>
								</>
							)}
						</Formik>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</>
	)
}

export default EditProfile
