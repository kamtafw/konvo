import ChatBubble from "@/components/ChatBubble"
import MessageInputBar from "@/components/MessageInputBar"
import { chats, users } from "@/data/mock"
import { useBackToDismissKeyboard } from "@/hooks/useKeyboard"
import { useTheme } from "@/providers/ThemeProvider"
import { getMessages } from "@/services/chat"
import { Ionicons } from "@expo/vector-icons"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { cssInterop } from "nativewind"
import { useEffect, useRef, useState } from "react"
import {
	FlatList,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

cssInterop(Ionicons, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

const userId = "u1"

const BackButton = ({ router }: { router: any }) => {
	return (
		<TouchableOpacity
			onPress={() => router.back()}
			className="flex items-center justify-center mr-4"
		>
			<Ionicons name="arrow-back-sharp" size={24} className="text-onSurface" />
		</TouchableOpacity>
	)
}

const Title = ({ name, avatar_url }: any) => {
	return (
		<View className="flex-row items-center gap-4">
			<Image source={{ uri: avatar_url }} className="w-12 h-12 rounded-full" />
			<Text className="text-xl text-onSurface font-bold">{name}</Text>
		</View>
	)
}

const Chat = () => {
	useBackToDismissKeyboard()
	const { id } = useLocalSearchParams()
	const { top } = useSafeAreaInsets()
	const { theme } = useTheme()
	const router = useRouter()

	console.log("ID:", id)
	// const messages = await getMessages(id)

	const chatId = typeof id === "string" ? id : id?.[0]
	const chat = chats.find((c) => c.id === chatId)
	const friendId = chat?.participants.find((id) => id !== userId)!
	const friend = users[friendId]

	const listRef = useRef<FlatList>(null)
	const [keyboardHeight, setKeyboardHeight] = useState(0)

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
			<View className="flex-1 items-center justify-center bg-white dark:bg-black">
				<Text className="text-zinc-500">Chat not found</Text>
			</View>
		)
	}

	return (
		<>
			<Stack.Screen
				options={{
					headerStyle: {
						backgroundColor: theme === "dark" ? "#0f172a" : "#f9fafb",
						borderBottomWidth: 0.5,
						borderBottomColor: theme === "dark" ? "#334155" : "#e5e7eb",
						height: 60 + top,
						padding: top,
					},
					// headerLeft: () => <BackButton router={router} />,
					headerTintColor: theme === "dark" ? "#e5e7eb" : "#334155",
					headerTitle: (props) => <Title name={friend.name} avatar_url={friend.avatar} {...props} />,
				}}
			/>
			<SafeAreaView
				className="flex-1 bg-background"
				// edges={["left", "right", "top"]}
			>
				<KeyboardAvoidingView
					className="flex-1"
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
				>
					<View className="flex-1">
						<FlatList
							ref={listRef}
							data={chat.messages}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<ChatBubble
									message={item}
									isOwn={item.sender === userId}
									sender={users[item.sender]}
								/>
							)}
							keyboardShouldPersistTaps="always"
							contentContainerStyle={{
								paddingVertical: 16,
								paddingHorizontal: 12,
								// paddingBottom: keyboardHeight + 80, // dynamic keyboard + input bar
							}}
							onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
							onLayout={() => listRef.current?.scrollToEnd({ animated: true })}
							showsVerticalScrollIndicator={false}
						/>

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
