import ChatBubble from "@/components/ChatBubble"
import MessageInputBar from "@/components/MessageInputBar"
import { useBackToDismissKeyboard } from "@/hooks/useKeyboard"
import { useTheme } from "@/providers/ThemeProvider"
import { useAuthStore } from "@/stores/authStore"
import { useChatStore } from "@/stores/chatStore"
import { Ionicons } from "@expo/vector-icons"
import clsx from "clsx"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { cssInterop } from "nativewind"
import { useEffect, useRef, useState } from "react"
import {
	ActivityIndicator,
	FlatList,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Text,
	View,
} from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"

cssInterop(Ionicons, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

const BackButton = ({ router }: { router: any }) => {
	return (
		<TouchableOpacity
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
				marginRight: 24,
			}}
			onPress={() => router.back()}
			className="flex items-center justify-center mr-4"
		>
			<Ionicons name="arrow-back-sharp" size={24} className="text-onSurface" />
		</TouchableOpacity>
	)
}

const Title = ({ name, uri }: any) => {
	return (
		<View className="flex-row items-center gap-2">
			<Image
				source={uri ? { uri } : require("../../../assets/images/avatar.png")}
				className={clsx("w-10 h-10 rounded-full", !uri && "bg-primary")}
			/>
			<Text className="text-xl text-onSurface font-bold">{name}</Text>
		</View>
	)
}

const Chat = () => {
	useBackToDismissKeyboard()
	const { id } = useLocalSearchParams()
	const { theme } = useTheme()
	const router = useRouter()
	const user = useAuthStore((state) => state.user)
	const { chats, messages, loadingMessages, fetchMessages } = useChatStore()

	const chatId = typeof id === "string" ? id : id?.[0]

	const chat = chats.find((c) => String(c.id) === chatId)
	const msgs = messages[chatId] || []
	const friend = chat?.participants.find((p) => p.id !== user?.id)

	const listRef = useRef<FlatList>(null)
	const [keyboardHeight, setKeyboardHeight] = useState(0)

	// fetch messages on mount
	useEffect(() => {
		if (chatId) {
			fetchMessages(chatId)
		}
	}, [chatId])

	// Manage keyboard height manually
	useEffect(() => {
		const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
			setKeyboardHeight(e.endCoordinates.height)
		})
		const hideSub = Keyboard.addListener("keyboardDidHide", () => {
			setKeyboardHeight(0)
		})
		return () => {
			showSub.remove()
			hideSub.remove()
		}
	}, [])

	if (!chat) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Text className="text-muted text-lg">Chat not found</Text>
			</View>
		)
	}

	return (
		<>
			<Stack.Screen
				options={{
					headerStyle: {
						backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
						borderBottomWidth: 0.5,
						borderBottomColor: theme === "dark" ? "#334155" : "#e5e7eb",
					},
					headerTintColor: theme === "dark" ? "#e5e7eb" : "#334155",
					// headerLeft: () => <BackButton router={router} />,
					headerTitle: () => <Title name={friend?.name} uri={friend?.avatar_url} />,
				}}
			/>
			<SafeAreaView className="flex-1 bg-background">
				<KeyboardAvoidingView
					className="flex-1"
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
				>
					<View className="flex-1">
						{loadingMessages[chatId] ? (
							<View className="flex-1 items-center justify-center">
								<ActivityIndicator size="large" />
							</View>
						) : (
							<FlatList
								ref={listRef}
								data={msgs}
								keyExtractor={(item) => item.id}
								renderItem={({ item }) => (
									<ChatBubble message={item} isOwn={item.sender.id === user?.id} />
								)}
								keyboardShouldPersistTaps="always"
								contentContainerStyle={{
									paddingVertical: 16,
									paddingHorizontal: 12,
								}}
								onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
								onLayout={() => listRef.current?.scrollToEnd({ animated: true })}
								showsVerticalScrollIndicator={false}
							/>
						)}
						{/* ⬇️ This stays fixed above the keyboard */}
						<View
							style={{
								paddingBottom: Platform.OS === "ios" ? 0 : keyboardHeight,
							}}
						>
							<MessageInputBar chatId={chat.id} />
						</View>
					</View>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</>
	)
}

export default Chat
