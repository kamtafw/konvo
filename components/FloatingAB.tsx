import { useTheme } from "@/providers/ThemeProvider"
import { Feather } from "@expo/vector-icons"
import clsx from "clsx"
import { cssInterop } from "nativewind"
import { Platform, TouchableOpacity } from "react-native"

cssInterop(Feather, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

const FloatingAB = ({ onPress }: { onPress: () => void }) => {
	const { theme } = useTheme()

	return (
		<TouchableOpacity
			onPress={onPress}
			className={clsx(
				"absolute right-8 z-50 bg-primary rounded-full p-4 shadow-lg",
				Platform.OS === "android" ? "bottom-14" : "bottom-18"
			)}
			style={{ elevation: 6 }}
		>
			<Feather name="plus" className={clsx(theme === "light" && "text-white")} size={24} />
		</TouchableOpacity>
	)
}

export default FloatingAB
