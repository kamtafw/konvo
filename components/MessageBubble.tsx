import { Ionicons } from "@expo/vector-icons"
import { cssInterop } from "nativewind"
import { Text, View } from "react-native"

cssInterop(Ionicons, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

interface Props {
	message: Message
	isMine: boolean
	currentUserId: string
}

const MessageBubble = ({ message, isMine, currentUserId }: Props) => {
	const safeIsMine = Boolean(
		isMine && currentUserId && String(message.sender) === String(currentUserId)
	)

	const alignment = safeIsMine ? "items-end" : "items-start"
	const bg = safeIsMine ? "bg-primary" : "bg-surface"
	const textColor = safeIsMine ? "text-onPrimary" : "text-onSurface"
	const timestampColor = safeIsMine ? "text-background" : "text-muted"

	return (
		message.text && (
			<View className={`mb-3 ${alignment}`}>
				<View className={`flex-col rounded-xl px-3 py-2 ${bg} max-w-[75%]`}>
					<Text className={`${textColor}`}>{message.text}</Text>

					{/* Timestamp + status */}
					<View className="flex-row items-center justify-end">
						<Text className={`text-[10px] ${timestampColor}`}>
							{`(${new Date(message.created_at).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})})`}
						</Text>
						{safeIsMine && (
							<View className="ml-1">
								{message.read_at ? (
									<Ionicons name="checkmark-done-outline" size={10} className={timestampColor} />
								) : (
									<Ionicons name="checkmark-outline" size={10} className={timestampColor} />
								)}
							</View>
						)}
					</View>
				</View>
			</View>
		)
	)
}

export default MessageBubble
