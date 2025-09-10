import { useTheme } from "@/providers/ThemeProvider"
import { Ionicons } from "@expo/vector-icons"
import clsx from "clsx"
import { cssInterop } from "nativewind"
import { useState } from "react"
import { TextInput, TouchableOpacity, View } from "react-native"

cssInterop(Ionicons, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

const MessageInputBar = ({ chatId, sendMessage, friendId }: any) => {
	const [message, setMessage] = useState("")
	const { theme } = useTheme()

	const handleSendMessage = () => {
		if (message.trim() === "") return
		sendMessage(chatId, message, friendId)
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
			<TouchableOpacity onPress={handleSendMessage} className="p-2 rounded-full bg-primary">
				<Ionicons name="send" size={18} className={clsx(theme === "light" && "text-white")} />
			</TouchableOpacity>
		</View>
	)
}

export default MessageInputBar
