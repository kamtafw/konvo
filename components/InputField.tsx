import { Ionicons } from "@expo/vector-icons"
import { cssInterop } from "nativewind"
import { forwardRef, useState } from "react"
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native"

cssInterop(Ionicons, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

type InputFieldProps = TextInputProps & {
	label: string
	error?: string | null
}

const InputField = ({ label, error, secureTextEntry, ...props }: any) => {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<View className="mb-5 gap-2">
			<Text className="text-sm text-textPrimary">{label}</Text>
			<View className="flex-row items-center border border-border rounded-lg px-4">
				<TextInput
					{...props}
					secureTextEntry={secureTextEntry && !showPassword}
					className="flex-1 py-3 text-onSurface text-sm placeholder:text-muted"
				/>
				{secureTextEntry && (
					<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
						<Ionicons name={showPassword ? "eye-off" : "eye"} size={18} className="text-muted" />
					</TouchableOpacity>
				)}
			</View>
			{error && <Text className="text-xs text-error">{error}</Text>}
		</View>
	)
}

const InputField2 = forwardRef<TextInputProps, InputFieldProps>(
	({ label, error, ...props }, ref) => {
		return (
			<View className="mb-5 gap-2">
				<Text className="text-sm text-textPrimary">{label}</Text>
				<TextInput
					ref={ref}
					{...props}
					className={`rounded-lg px-4 py-3 border ${
						error ? "border-error" : "border-border"
					} text-onSurface text-sm placeholder:text-muted`}
				/>
				{error && <Text className="text-xs text-error">{error}</Text>}
			</View>
		)
	}
)

export default InputField
