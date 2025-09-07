import InputField from "@/components/InputField"
import { useAccountForm } from "@/hooks/useAccountForm"
import { useAuthStore } from "@/stores/authStore"
import { normalizePhone } from "@/utils/validation"
import { Ionicons } from "@expo/vector-icons"
import clsx from "clsx"
import { Formik } from "formik"
import { useState } from "react"
import { ActivityIndicator, Keyboard, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Yup from "yup"

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
	const [isSignup, setIsSignup] = useState(false)
	const login = useAuthStore((state) => state.login)
	const signup = useAuthStore((state) => state.signup)

	const onSubmit = async (values: any) => {
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
		} catch (err) {
			console.log(`${isSignup ? "Signup" : "Login"} failed: ${err}`)
			// Optional: set form error or toast
		}
	}

	return (
		<SafeAreaView className="flex-1 px-4 py-12 bg-background" edges={["left", "right", "top"]}>
			<Text className="text-2xl font-semibold text-onSurface mb-1">
				{isSignup ? "Sign up for a personal account" : "Login to your account"}
			</Text>
			<Text className="text-sm text-muted mb-8">
				{isSignup ? "Just a few quick steps to get started" : "Welcome back, you've been missed"}
			</Text>

			{/* Toggle Buttons */}
			<View className="flex-row bg-primary rounded-lg p-1 mb-6">
				<TouchableOpacity
					className={clsx("flex-1 py-2 rounded-lg", !isSignup && "bg-surface")}
					onPress={() => {
						setIsSignup(false)
					}}
				>
					<Text
						className={`text-center font-medium ${!isSignup ? "text-onSurface" : "text-onPrimary"}`}
					>
						Login
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className={clsx("flex-1 py-2 rounded-lg", isSignup && "bg-surface")}
					onPress={() => {
						setIsSignup(true)
					}}
				>
					<Text
						className={`text-center font-medium ${isSignup ? "text-onSurface" : "text-onPrimary"}`}
					>
						Sign Up
					</Text>
				</TouchableOpacity>
			</View>

			<Formik
				initialValues={{ phone: "", username: "", email: "", password: "", confirmPassword: "" }}
				validationSchema={getSchema(isSignup)}
				onSubmit={onSubmit}
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
					resetForm,
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
								value={values.phone}
								error={touched.phone ? errors.phone : null}
							/>

							{/* Username */}
							{isSignup && (
								<InputField
									label="Username"
									placeholder="Enter your username"
									onChangeText={handleChange("username")}
									onBlur={handleBlur("username")}
									value={values.username}
									error={touched.username ? errors.username : null}
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
									value={values.email}
									error={touched.email ? errors.email : null}
								/>
							)}

							{/* Password */}
							<InputField
								label="Password"
								placeholder="Enter your password"
								secureTextEntry
								onChangeText={handleChange("password")}
								onBlur={handleBlur("password")}
								value={values.password}
								error={touched.password ? errors.password : null}
							/>

							{/* Confirm Password */}
							{isSignup && (
								<InputField
									label="Confirm Password"
									placeholder="Confirm your password"
									secureTextEntry
									onChangeText={handleChange("confirmPassword")}
									onBlur={handleBlur("confirmPassword")}
									value={values.confirmPassword}
									error={touched.confirmPassword ? errors.confirmPassword : null}
								/>
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
								<ActivityIndicator />
							) : (
								<Text className="text-center text-xl text-onPrimary font-medium">
									{isSignup ? "Sign up" : "Login"}
								</Text>
							)}
						</TouchableOpacity>
					</>
				)}
			</Formik>

			<View className="items-center mt-4 gap-4">
				<View className="flex-row gap-5 items-center mb-5">
					<View className="flex-1 h-px bg-border" />
					<Text className="text-textPrimary text-lg">Or with</Text>
					<View className="flex-1 h-px bg-border" />
				</View>

				<View className="flex-row gap-4">
					<TouchableOpacity className="flex-1 border border-border px-6 py-2 rounded-lg flex-row justify-center items-center gap-2">
						<Ionicons name="logo-google" size={20} color="#EA4335" />
						<Text className="text-onSurface font-medium">Google</Text>
					</TouchableOpacity>
					<TouchableOpacity className="flex-1 border border-border px-6 py-2 rounded-lg flex-row justify-center items-center gap-2">
						<Ionicons name="logo-facebook" size={20} color="#1877F2" />
						<Text className="text-onSurface font-medium">Facebook</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	)
}

const Account2 = () => {
	const [isSignup, setIsSignup] = useState(false)
	const { form, errors, touched, updateField, validateField, validateAll, setTouched, reset } =
		useAccountForm(isSignup)
	const login = useAuthStore((state) => state.login)
	const signup = useAuthStore((state) => state.signup)

	const handleBlur = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }))
		validateField(field, form[field])
	}

	const handleFocus = (field: string) => {
		if (field === "password" && touched.email) validateField("email", form.email)
		if (field === "confirmPassword") validateField("password", form.password)
	}

	const handleSubmit = async () => {
		Keyboard.dismiss()
		if (!validateAll()) return

		const payload = {
			...form,
			phone: normalizePhone(form.phone),
		}

		try {
			if (isSignup) {
				await signup(payload)
			} else {
				await login({ phone: payload.phone, password: payload.password })
			}
			reset()
		} catch (err) {
			// Optional: set form error or toast
		}
	}

	const toggleSecure = (field: any) =>
		updateField(field, { ...form.secureText, [field]: !form.secureText[field] })

	const isDisabled = isSignup
		? !form.phone || !form.name || !form.email || !form.password || !form.confirmPassword
		: !form.phone || !form.password

	return (
		<SafeAreaView className="flex-1 px-4 py-12 bg-background" edges={["left", "right", "top"]}>
			<Text className="text-2xl font-semibold text-onSurface mb-1">
				{isSignup ? "Sign up for a personal account" : "Login to your account"}
			</Text>
			<Text className="text-sm text-muted mb-8">
				{isSignup ? "Just a few quick steps to get started" : "Welcome back, you've been missed"}
			</Text>

			{/* Toggle Buttons */}
			<View className="flex-row bg-primary rounded-lg p-1 mb-6">
				<TouchableOpacity
					className={clsx("flex-1 py-2 rounded-lg", !isSignup && "bg-surface")}
					onPress={() => {
						setIsSignup(false)
						reset()
					}}
				>
					<Text
						className={`text-center font-medium ${!isSignup ? "text-onSurface" : "text-onPrimary"}`}
					>
						Login
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className={clsx("flex-1 py-2 rounded-lg", isSignup && "bg-surface")}
					onPress={() => {
						setIsSignup(true)
						reset()
					}}
				>
					<Text
						className={`text-center font-medium ${isSignup ? "text-onSurface" : "text-onPrimary"}`}
					>
						Sign Up
					</Text>
				</TouchableOpacity>
			</View>

			{/* Form */}
			<View className="p-3 bg-surface rounded-lg shadow-md">
				{errors.form && <Text className="text-xs text-error mb-4">{errors.form}</Text>}

				{/* Phone */}
				<InputField
					label="Phone"
					placeholder="08012345678"
					keyboardType="phone-pad"
					value={form.phone}
					onChangeText={(t: string) => {
						updateField("phone", t)
					}}
					onBlur={() => handleBlur("phone")}
					onFocus={() => handleFocus("phone")}
					error={touched.phone && errors.phone}
				/>

				{/* Name */}
				{isSignup && (
					<InputField
						label="Name"
						placeholder="Paul"
						value={form.name}
						onChangeText={(t: string) => updateField("name", t)}
						onBlur={() => handleBlur("name")}
						onFocus={() => handleFocus("name")}
						error={touched.name && errors.name}
					/>
				)}

				{/* Email */}
				{isSignup && (
					<InputField
						label="Email"
						placeholder="simon@example.com"
						keyboardType="email-address"
						autoCapitalize="none"
						value={form.email}
						onChange={(t: string) => updateField("email", t)}
						onBlur={() => handleBlur("email")}
						onFocus={() => handleFocus("email")}
						error={touched.email && errors.email}
					/>
				)}

				{/* Password */}
				<PasswordField
					label="Password"
					value={form.password}
					onChange={(t: string) => updateField("password", t)}
					onBlur={() => handleBlur("password")}
					onFocus={() => handleFocus("password")}
					secure={!form.secureText?.password}
					toggleSecure={() =>
						updateField("secureText", {
							...form.secureText,
							password: !form.secureText?.password,
						})
					}
					error={touched.password && errors.password}
				/>

				{/* Confirm Password */}
				{isSignup && (
					<PasswordField
						label="Confirm Password"
						value={form.confirmPassword}
						onChange={(t) => updateField("confirmPassword", t)}
						onBlur={() => handleBlur("confirmPassword")}
						onFocus={() => handleFocus("confirmPassword")}
						secure={!form.secureText?.confirmPassword}
						toggleSecure={() =>
							updateField("secureText", {
								...form.secureText,
								confirmPassword: !form.secureText?.confirmPassword,
							})
						}
						error={touched.confirmPassword && errors.confirmPassword}
					/>
				)}

				{/* Forgot Password */}
				{!isSignup && (
					<View className="flex-row justify-between items-center mb-4">
						<View className="flex-row items-center">{/* add `Remember Me` */}</View>
						<TouchableOpacity>
							<Text className="text-primary text-sm">Forgot Password?</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>

			{/* Submit Button */}
			<TouchableOpacity
				disabled={isDisabled}
				className={clsx("bg-primary rounded-lg py-3 my-6", isDisabled && "opacity-40")}
				onPress={handleSubmit}
			>
				<Text className="text-center text-xl text-onPrimary font-medium">
					{isSignup ? "Sign up" : "Login"}
				</Text>
			</TouchableOpacity>

			<View className="items-center mt-4 gap-4">
				<View className="flex-row gap-5 items-center mb-5">
					<View className="flex-1 h-px bg-border" />
					<Text className="text-textPrimary text-lg">Or with</Text>
					<View className="flex-1 h-px bg-border" />
				</View>

				<View className="flex-row gap-4">
					<TouchableOpacity className="flex-1 border border-border px-6 py-2 rounded-lg flex-row justify-center items-center gap-2">
						<Ionicons name="logo-google" size={20} color="#EA4335" />
						<Text className="text-onSurface font-medium">Google</Text>
					</TouchableOpacity>
					<TouchableOpacity className="flex-1 border border-border px-6 py-2 rounded-lg flex-row justify-center items-center gap-2">
						<Ionicons name="logo-facebook" size={20} color="#1877F2" />
						<Text className="text-onSurface font-medium">Facebook</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	)
}

export default Account
