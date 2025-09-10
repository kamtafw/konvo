import MessageBubble from "@/components/MessageBubble"
import MessageInputBar from "@/components/MessageInputBar"
import { useBackToDismissKeyboard } from "@/hooks/useKeyboard"
import { useRelativeTime } from "@/hooks/useRelativeTime"
import { useTheme } from "@/providers/ThemeProvider"
import { useAuthStore } from "@/stores/authStore"
import { useChatSocketStore } from "@/stores/chatSocketStore"
import { useChatStore } from "@/stores/chatStore"
import { useFriendStore } from "@/stores/friendStore"
import { Ionicons } from "@expo/vector-icons"
import clsx from "clsx"
import { Stack, useLocalSearchParams } from "expo-router"
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

const Title = ({ name, uri, presence }: any) => {
	const isOnline = presence?.status === "online"
	const relativeLastSeen = useRelativeTime(presence?.last_seen)

	return (
		<View className="flex-row items-center gap-2">
			<Image
				source={uri ? { uri } : require("../../../assets/images/avatar.png")}
				className={clsx("w-10 h-10 rounded-full", !uri && "bg-primary")}
			/>
			<View>
				<Text className="text-xl text-onSurface font-bold">{name}</Text>
				{isOnline ? (
					<Text className="text-sm text-primary">Online</Text>
				) : (
					relativeLastSeen && (
						<Text className="text-sm text-textSecondary">last seen {relativeLastSeen}</Text>
					)
				)}
			</View>
		</View>
	)
}

const Chat = () => {
	useBackToDismissKeyboard()
	const { id, friendId } = useLocalSearchParams()
	const { theme } = useTheme()

	const { sendMessage } = useChatSocketStore()
	const user = useAuthStore((state) => state.user)
	const friendList = useFriendStore((state) => state.friendList)
	const { chats, messages, loadingMessages, typing, presence } = useChatStore()

	const resolveChatAndFriend = (): any => {
		if (id && id !== "new") {
			const chat = chats.find((c) => String(c.id) === String(id))
			const friend = chat?.participants.find((p) => String(p.id) !== String(user?.id))
			return { chat, friend, chatId: String(id) }
		} else if (friendId) {
			// first check if a real chat exists
			const existingChat = chats.find(
				(c) =>
					c.participants.some((p) => String(p.id) === friendId) &&
					!String(c.id).startsWith("placeholder_") // exclude placeholder chats
			)

			if (existingChat) {
				const friend = existingChat.participants.find((p) => String(p.id) !== String(user?.id))
				return { chat: existingChat, friend, chatId: String(existingChat.id) }
			}

			// if no real chat exists, check for placeholder chats
			const placeholderChat = chats.find(
				(c) => String(c.id).includes(String(friendId)) && String(c.id).startsWith("placeholder_")
			)

			if (placeholderChat) {
				const friend = friendList.find((f) => String(f.friend.id) === friendId)?.friend
				return { chat: placeholderChat, friend, chatId: String(placeholderChat.id) }
			}

			// no chat exists yet, return friend info for new chat
			const friend = friendList.find((f) => String(f.friend.id) === friendId)?.friend
			return { chat: null, friend, chatId: null }
		}

		return { chat: null, friend: null, chatId: null }
	}

	const { friend, chatId } = resolveChatAndFriend()

	const msgs = messages[chatId] || []
	const friendTyping = friend ? typing?.[chatId]?.[friendId] : false
	const friendPresence = friend ? presence?.[friend?.id] : null

	const listRef = useRef<FlatList>(null)
	const [keyboardHeight, setKeyboardHeight] = useState(0)

	useEffect(() => {
		if (!chatId) return

		useChatStore.getState().setActiveChat(String(chatId))

		const doInit = async () => {
			// only fetch messages if it's not a placeholder chat
			if (!String(chatId).startsWith("placeholder_")) {
				await useChatStore.getState().fetchMessages(String(chatId))
			}
			useChatSocketStore.getState().readChat(String(chatId))
		}

		doInit()

		return () => useChatStore.getState().setActiveChat(null)
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
					headerTitle: () => (
						<Title name={friend?.name} uri={friend?.avatar_url} presence={friendPresence} />
					),
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
									<MessageBubble message={item} isMine={String(item.sender) === String(user?.id)} />
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
						{friendTyping && (
							<View className="px-4 pb-1 mb-2">
								<Text className="italic text-sm text-muted">{friend?.name} is typing...</Text>
							</View>
						)}
						{/* ⬇️ This stays fixed above the keyboard */}
						<View
							style={{
								paddingBottom: Platform.OS === "ios" ? 0 : keyboardHeight,
							}}
						>
							<MessageInputBar chatId={chatId} sendMessage={sendMessage} friendId={friendId} />
						</View>
					</View>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</>
	)
}

export default Chat
