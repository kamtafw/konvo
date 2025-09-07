import { useTheme } from "@/providers/ThemeProvider"
import { Ionicons } from "@expo/vector-icons"
import clsx from "clsx"
import { cssInterop } from "nativewind"
import { useState } from "react"
import { Pressable, TextInput, View } from "react-native"

cssInterop(Ionicons, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

const MessageInputBar = ({ chatId, sendMessage }: any) => {
	const [message, setMessage] = useState("")
	const { theme } = useTheme()

	const send = () => {
		if (message.trim() === "") return
		sendMessage(chatId, message)
		setMessage("")
	}

	return (
		<View className="flex-row items-center p-3 min-h-16 border-t border-border bg-background">
			<TextInput
				value={message}
				onChangeText={setMessage}
				placeholder="Type a message..."
				className="flex-1 mr-2 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full text-onSurface"
				placeholderTextColor="#aaa"
			/>
			<Pressable onPress={send} className="p-2 rounded-full bg-primary">
				<Ionicons name="send" size={18} className={clsx(theme === "light" && "text-white")} />
			</Pressable>
		</View>
	)
}

export default MessageInputBar
