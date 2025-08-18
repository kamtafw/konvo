import FloatingAB from "@/components/FloatingAB"
import { useBootstrapApp } from "@/hooks/useBootstrapApp"
import { useAuthStore } from "@/stores/authStore"
import { useChatStore } from "@/stores/chatStore"
import { Entypo } from "@expo/vector-icons"
import clsx from "clsx"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { router } from "expo-router"
import { cssInterop } from "nativewind"
import { useMemo, useState } from "react"
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native"

dayjs.extend(relativeTime)

cssInterop(Entypo, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

const ChatSkeleton = () => (
	<View className="flex-row items-center p-4 border-b border-border bg-surface">
		<View className="w-12 h-12 rounded-full bg-primary mr-4" />
		<View className="flex-1">
			<View className="w-2/3 h-4 bg-muted rounded mb-2" />
			<View className="w-1/2 h-3 bg-muted rounded" />
		</View>
	</View>
)

const ChatList = () => {
	const { ready } = useBootstrapApp()
	const user = useAuthStore((state) => state.user)
	const chats = useChatStore((state) => state.chats)
	const [searchQuery, setSearchQuery] = useState("")

	const userId = user?.id

	const filteredChats = useMemo(() => {
		return [...chats]
			.filter((chat) => {
				const friends = chat.participants.filter((p) => p.id !== userId)
				const displayName = friends
					.map((p) => p.name || "")
					.join(", ")
					.toLowerCase()
				const lastMsg = chat.last_message?.text?.toLowerCase() || ""
				const query = searchQuery.toLowerCase()
				return displayName.includes(query) || lastMsg.includes(query)
			})
			.sort((a, b) => {
				const pinnedDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
				if (pinnedDiff !== 0) return pinnedDiff
				const aTime = new Date(a.last_message?.created_at || a.created_at).getTime()
				const bTime = new Date(b.last_message?.created_at || b.created_at).getTime()
				return bTime - aTime
			})
	}, [chats, searchQuery, userId])

	const renderItem = ({ item }: { item: Chat }) => {
		const friend = item.participants.find((p) => p.id !== userId)!
		const displayName = friend?.name || "Unknown"
		const uri = friend?.avatar_url
		const lastMessage = item.last_message
		const unreadCount = item.unread_count
		const isTyping = item.typing
		const isPinned = item.pinned

		return (
			<TouchableOpacity
				onPress={() => router.push(`/chat/${item.id}`)}
				className="flex-row items-center p-4 border-b border-border bg-surface"
			>
				<Image
					className={clsx("w-12 h-12 rounded-full mr-4", !uri && "bg-primary")}
					source={uri ? { uri } : require("../../../assets/images/avatar.png")}
				/>
				<View className="flex-1">
					<Text className="text-onSurface text-base font-semibold">{displayName}</Text>
					<Text
						className={clsx("text-sm", isTyping ? "text-primary" : "text-onSurface")}
						numberOfLines={1}
					>
						{isTyping ? "typing..." : lastMessage?.text}
					</Text>
				</View>
				<View className="flex-row items-center">
					<View className={clsx("flex items-end gap-1", isPinned && "mr-2")}>
						<Text className="text-xs text-muted">
							{lastMessage?.created_at ? dayjs(lastMessage.created_at).fromNow() : ""}
						</Text>
						{!isTyping && lastMessage?.sender === userId && (
							<Text className="text-xs text-muted">{"✓"}</Text>
						)}
						{unreadCount > 0 && (
							<View className="bg-primary rounded-full px-2 py-0.5">
								<Text className="text-xs text-white">{unreadCount}</Text>
							</View>
						)}
					</View>
					{isPinned && <Entypo name="pin" size={14} className="text-muted" />}
				</View>
			</TouchableOpacity>
		)
	}

	return (
		<View className="flex-1 pt-6 bg-background">
			<TextInput
				placeholder="Search chats or users"
				value={searchQuery}
				onChangeText={setSearchQuery}
				className="mx-4 mb-4 p-4 rounded-3xl bg-surface text-onSurface"
				placeholderTextColor="#888"
			/>

			{!ready ? (
				<FlatList
					data={Array(7).fill(null)}
					keyExtractor={(_, idx) => `skeleton-${idx}`}
					renderItem={() => <ChatSkeleton />}
				/>
			) : filteredChats.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-muted">No chats yet</Text>
				</View>
			) : (
				<FlatList
					data={filteredChats}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={{ paddingBottom: 20 }}
					className="bg-background"
				/>
			)}

			<FloatingAB />
		</View>
	)
}

export default ChatList
