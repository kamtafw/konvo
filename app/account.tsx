import InputField from "@/components/InputField"
import { useBackToDismissKeyboard, useKeyboardHeight } from "@/hooks/useKeyboard"
import { useAuthStore } from "@/stores/authStore"
import { normalizePhone } from "@/utils/validation"
import { Ionicons } from "@expo/vector-icons"
import clsx from "clsx"
import { Formik } from "formik"
import { useCallback, useEffect, useRef, useState } from "react"
import {
	ActivityIndicator,
	Dimensions,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Yup from "yup"

interface FormToggleProps {
	isSignup: boolean
	onToggle: (isSignup: boolean) => void
}

const FormToggle = ({ isSignup, onToggle }: FormToggleProps) => {
	return (
		<View className="flex-row bg-primary rounded-lg p-1 mb-6">
			<TouchableOpacity
				className={clsx("flex-1 py-2 rounded-lg", !isSignup && "bg-surface")}
				onPress={() => onToggle(false)}
			>
				<Text
					className={`text-center font-medium ${!isSignup ? "text-onSurface" : "text-onPrimary"}`}
				>
					Login
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				className={clsx("flex-1 py-2 rounded-lg", isSignup && "bg-surface")}
				onPress={() => onToggle(true)}
			>
				<Text
					className={`text-center font-medium ${isSignup ? "text-onSurface" : "text-onPrimary"}`}
				>
					Sign Up
				</Text>
			</TouchableOpacity>
		</View>
	)
}

interface SocialButtonProps {
	icon: string
	text: string
	color: string
	onPress?: () => void
}

const SocialButton = ({ icon, text, color, onPress }: SocialButtonProps) => (
	<TouchableOpacity
		className="flex-1 flex-row border border-border px-6 py-2 items-center justify-center gap-2 rounded-lg"
		onPress={onPress}
	>
		<Ionicons name={icon as any} size={20} color={color} />
		<Text className="ml-2 text-white">{text}</Text>
	</TouchableOpacity>
)

const SocialAuth = () => (
	<View className="items-center mt-4 gap-4">
		<View className="flex-row gap-5 items-center mb-5">
			<View className="flex-1 h-px bg-border" />
			<Text className="text-lg text-textPrimary">Or with</Text>
			<View className="flex-1 h-px bg-border" />
		</View>

		<View className="flex-row gap-4">
			<SocialButton
				icon="logo-google"
				text="Google"
				color="#EA4335"
				onPress={() => console.log("Google login")}
			/>
			<SocialButton
				icon="logo-facebook"
				text="Facebook"
				color="#1877F2"
				onPress={() => console.log("Facebook login")}
			/>
		</View>
	</View>
)

const getSchema = (isSignup: boolean) =>
	Yup.object().shape({
		phone: Yup.string()
			.matches(/^(\+234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number")
			.required("Phone number is required"),

		...(isSignup && {
			username: Yup.string()
				.matches(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed")
				.min(3, "Username too short")
				.max(20, "Username too long")
				.required("Username is required"),

			email: Yup.string().email("Invalid email address").required("Email is required"),

			confirmPassword: Yup.string()
				.oneOf([Yup.ref("password")], "Passwords must match")
				.required("Please confirm your password"),
		}),

		password: Yup.string()
			.min(6, "Password must be at least 6 characters")
			.required("Password is required"),
	})

const Account = () => {
	useBackToDismissKeyboard()
	const { isKeyboardVisible, keyboardHeight } = useKeyboardHeight()

	const [isSignup, setIsSignup] = useState(false)
	const scrollViewRef = useRef<ScrollView>(null)
	const [activeFieldId, setActiveFieldId] = useState(-1)
	const [showHeaderShadow, setShowHeaderShadow] = useState(false)

	const login = useAuthStore((state) => state.login)
	const signup = useAuthStore((state) => state.signup)

	const initialValues = {
		phone: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	}

	const handleToggle = useCallback((newIsSignup: boolean) => {
		setIsSignup(newIsSignup)
	}, [])

	const handleSubmit = useCallback(
		async (values: any, { setSubmitting, resetForm }: any) => {
			Keyboard.dismiss()

			const payload = {
				...values,
				phone: normalizePhone(values.phone),
				name: values.username,
			}

			try {
				if (isSignup) {
					await signup(payload)
				} else {
					await login({ phone: payload.phone, password: payload.password })
				}
				resetForm()
			} catch (err) {
				console.log(`${isSignup ? "Signup" : "Login"} failed: ${err}`)
				// Optional: set form error or toast
			} finally {
				setSubmitting(false)
			}
		},
		[isSignup, signup, login]
	)

	// auto-scroll when keyboard appears
	useEffect(() => {
		if (isKeyboardVisible && scrollViewRef.current) {
			setTimeout(() => {
				scrollViewRef.current?.scrollToEnd({ animated: true })
			}, 100)
		}
	}, [isKeyboardVisible])

	const handleInputFocus = useCallback((fieldId: number) => {
		setActiveFieldId(fieldId)

		setTimeout(() => {
			if (scrollViewRef.current) {
				// calculate scroll position based on field id
				const scrollOffset = fieldId * 80 // adjust multiplier
				scrollViewRef.current.scrollTo({ y: scrollOffset, animated: true })
			}
		}, 300)
	}, [])

	const handleScroll = (event: any) => {
		const scrollY = event.nativeEvent.contentOffsetY
		setShowHeaderShadow(scrollY > 10)
	}

	const screenHeight = Dimensions.get("window").height

	return (
		<SafeAreaView className="flex-1 bg-background">
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
			>
				<View
					className={`bg-background px-4 pt-12 border-b border-border ${showHeaderShadow ? "shadow-lg" : ""}`}
				>
					<Text className="text-2xl font-semibold text-onSurface mb-1">
						{isSignup ? "Sign up for a personal account" : "Login to your account"}
					</Text>
					<Text className="text-sm text-muted mb-6">
						{isSignup
							? "Just a few quick steps to get started"
							: "Welcome back, you've been missed"}
					</Text>
					<FormToggle isSignup={isSignup} onToggle={handleToggle} />
				</View>

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
					onScroll={handleScroll}
					scrollEventThrottle={16}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					bounces={true}
					nestedScrollEnabled={true}
				>
					<Formik
						initialValues={initialValues}
						validationSchema={getSchema(isSignup)}
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
								<View className="p-3 bg-surface rounded-lg shadow-md">
									{/* Phone */}
									<InputField
										label="Phone"
										placeholder="Enter your phone number"
										keyboardType="phone-pad"
										onChangeText={handleChange("phone")}
										onBlur={handleBlur("phone")}
										onFocus={() => handleInputFocus(0)}
										value={values.phone}
										error={touched.phone ? errors.phone : null}
										editable={!isSubmitting}
									/>

									{/* Username */}
									{isSignup && (
										<InputField
											label="Username"
											placeholder="Enter your username"
											onChangeText={handleChange("username")}
											onBlur={handleBlur("username")}
											onFocus={() => handleInputFocus(isSignup ? 1 : 0)}
											value={values.username}
											error={touched.username ? errors.username : null}
											editable={!isSubmitting}
										/>
									)}

									{/* Email */}
									{isSignup && (
										<InputField
											label="Email"
											placeholder="Enter your email"
											keyboardType="email-address"
											autoCapitalize="none"
											onChangeText={handleChange("email")}
											onBlur={handleBlur("email")}
											onFocus={() => handleInputFocus(2)}
											value={values.email}
											error={touched.email ? errors.email : null}
											editable={!isSubmitting}
										/>
									)}

									{/* Password */}
									<InputField
										label="Password"
										placeholder="Enter your password"
										secureTextEntry
										onChangeText={handleChange("password")}
										onBlur={handleBlur("password")}
										onFocus={() => handleInputFocus(isSignup ? 3 : 1)}
										value={values.password}
										error={touched.password ? errors.password : null}
										editable={!isSubmitting}
									/>

									{/* Confirm Password */}
									{isSignup && (
										<InputField
											label="Confirm Password"
											placeholder="Confirm your password"
											secureTextEntry
											onChangeText={handleChange("confirmPassword")}
											onBlur={handleBlur("confirmPassword")}
											onFocus={() => handleInputFocus(4)}
											value={values.confirmPassword}
											error={touched.confirmPassword ? errors.confirmPassword : null}
											editable={!isSubmitting}
										/>
									)}

									{!isSignup && (
										<View className="flex-row justify-between items-center mt-4">
											<View className="flex-row items-center">
												{/* Add Remember Me checkbox here if needed */}
												{/* <Text className="text-primary text-sm">Remember me</Text> */}
											</View>
											<TouchableOpacity disabled={isSubmitting}>
												<Text className="text-primary text-sm">Forgot Password?</Text>
											</TouchableOpacity>
										</View>
									)}
								</View>

								{/* Submit Button */}
								<TouchableOpacity
									disabled={!(isValid && dirty) || isSubmitting}
									className={clsx(
										"bg-primary rounded-lg py-3 my-6",
										(!(isValid && dirty) || isSubmitting) && "opacity-40"
									)}
									onPress={handleSubmit as any}
								>
									{isSubmitting ? (
										<ActivityIndicator className="text-onSurface" />
									) : (
										<Text className="text-center text-xl text-onPrimary font-medium">
											{isSignup ? "Sign up" : "Login"}
										</Text>
									)}
								</TouchableOpacity>
							</>
						)}
					</Formik>

					<SocialAuth />
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

export default Account
