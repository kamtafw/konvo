import FloatingAB from "@/components/FloatingAB"
import { useBootstrapApp } from "@/hooks/useBootstrapApp"
import { useAuthStore } from "@/stores/authStore"
import { useChatStore } from "@/stores/chatStore"
import { useFriendStore } from "@/stores/friendStore"
import { Entypo, Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import clsx from "clsx"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { router } from "expo-router"
import { cssInterop } from "nativewind"
import { useCallback, useMemo, useState } from "react"
import { FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native"

dayjs.extend(relativeTime)

cssInterop(Entypo, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

cssInterop(Ionicons, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

interface FriendItemProps {
	user: Profile
	onProfilePress: (user: Profile) => void
}

interface FriendListModalProps {
	friends: Friend[]
	visible: boolean
	onSelect: (user: Profile) => void
	onClose: () => void
}

const FriendListModal = ({ friends, visible, onSelect, onClose }: FriendListModalProps) => {
	const [searchQuery, setSearchQuery] = useState("")

	const filteredFriends = useMemo(() => {
		return [...friends]
			.filter((f) => f.friend.name.toLowerCase().includes(searchQuery.toLowerCase()))
			.sort((a, b) => a.friend.name.localeCompare(b.friend.name))
	}, [friends, searchQuery])

	const FriendItem = ({ user, onProfilePress }: FriendItemProps) => {
		const uri = user.avatar_url

		return (
			<View className="flex-row items-center px-1 py-4 border-b border-border">
				<TouchableOpacity
					className="flex-1 flex-row items-center"
					onPress={() => onProfilePress(user)}
				>
					<Image
						className={`w-12 h-12 rounded-full mr-4 ${!uri && "bg-primary"}`}
						source={uri ? { uri } : require("../../../assets/images/avatar.png")}
					/>
					<View className="flex-1">
						<Text className="text-lg font-semibold text-onSurface">{user.name}</Text>
						<Text className="text-sm text-muted">{user.bio}</Text>
					</View>
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<Modal visible={visible} animationType="slide" onRequestClose={onClose}>
			<View className="flex-1 bg-background p-4">
				{/* Header */}
				<View className="flex-row justify-between items-center pt-4 mb-4">
					<View>
						<Text className="text-xl text-onSurface font-bold">Start Chat</Text>
						<Text className="text-sm text-muted">{friends?.length} friends</Text>
					</View>
					{/* <TouchableOpacity className="bg-surface rounded-full" onPress={onClose}>
						<Ionicons name="close-outline" size={20} className="text-error p-1" />
						<Text className="text-error">Close</Text>
					</TouchableOpacity> */}
				</View>

				{/* Search bar */}
				<TextInput
					placeholder="Search friends..."
					value={searchQuery}
					onChangeText={setSearchQuery}
					className="mx-4 mb-4 p-4 rounded-3xl bg-surface text-onSurface"
					placeholderTextColor="#888"
				/>

				{/* Friends list */}
				{/* <ScrollView>
					{filteredFriends.map((f) => (
						<FriendItem key={f.id} user={f.friend} onProfilePress={onSelect} />
					))}
				</ScrollView> */}
				<FlatList
					data={filteredFriends}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => <FriendItem user={item.friend} onProfilePress={onSelect} />}
					ListEmptyComponent={
						<View className="p-4">
							<Text className="text-center text-muted">No friends found</Text>
						</View>
					}
				/>

				{/* Footer */}
				<View className="border-t border-border">
					<TouchableOpacity className="p-4" onPress={onClose}>
						<Text className="text-center text-primary">Close</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	)
}

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
	const typingMap = useChatStore((state) => state.typing)
	const [searchQuery, setSearchQuery] = useState("")

	const friendList = useFriendStore((state) => state.friendList)
	const [showFriendList, setShowFriendList] = useState<boolean>(false)

	const userId = String(user?.id)

	useFocusEffect(
		useCallback(() => {
			// TODO: this isn't working as expected still; chat list isn't updated on return
			// useChatStore.getState().fetchChats({ force: true })
			useChatStore.getState().fetchChats()
		}, [])
	)

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
		const friend = item.participants.find((p) => String(p.id) !== userId)!
		const isTyping = !!typingMap?.[item.id]?.[friend?.id]
		const displayName = friend?.name || "Unknown"
		const uri = friend?.avatar_url
		const lastMessage = item.last_message
		const unreadCount = item.unread_count
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
					<Text className="text-onSurface text-base font-bold">{displayName}</Text>
					<Text
						className={clsx(
							"text-sm",
							isTyping
								? "text-primary"
								: unreadCount > 0
									? "font-semibold text-onSurface"
									: "text-muted"
						)}
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
						{!isTyping &&
							String(lastMessage?.sender) === userId &&
							(lastMessage?.read_at ? (
								<Ionicons name="checkmark-done-outline" size={14} className="text-muted" />
							) : (
								<Ionicons name="checkmark-outline" size={14} className="text-muted" />
							))}
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

			<FloatingAB onPress={() => setShowFriendList(true)} />

			<FriendListModal
				friends={friendList}
				visible={showFriendList}
				onSelect={(friend) => {
					console.log("Start chat with:", friend.name)
					setShowFriendList(false)
				}}
				onClose={() => setShowFriendList(false)}
			/>
		</View>
	)
}

export default ChatList
