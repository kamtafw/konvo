import { Text, View } from "react-native"

interface Props {
	message: Message
	isMine: boolean
}

const MessageBubble = ({ message, isMine }: Props) => {
	const alignment = isMine ? "items-end" : "items-start"
	const bg = isMine ? "bg-primary" : "bg-surface"
	const textColor = isMine ? "text-onPrimary" : "text-onSurface"
	const timestampColor = isMine ? "text-background" : "text-muted"

	return (
		message.text && (
			<View className={`mb-3 ${alignment}`}>
				<View className={`flex-row gap-2 items-end rounded-xl px-3 py-2 ${bg} max-w-[75%]`}>
					<Text className={`${textColor} pb-1`}>{message.text}</Text>

					{/* Timestamp + status */}
					<Text className={`text-[10px] ${timestampColor}`}>
						{new Date(message.created_at).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}{" "}
						{isMine ? (!message.read_at ? "✓" : "✓✓") : ""}
					</Text>
				</View>
			</View>
		)
	)
}

export default MessageBubble
