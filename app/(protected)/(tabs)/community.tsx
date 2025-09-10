import { useFriendSocketStore } from "@/stores/friendSocketStore"
import { useFriendStore } from "@/stores/friendStore"
import { Feather, Ionicons } from "@expo/vector-icons"
import clsx from "clsx"
import { cssInterop } from "nativewind"
import { useEffect, useState } from "react"
import { Image, Modal, Text, TouchableOpacity, View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import { SafeAreaView } from "react-native-safe-area-context"

cssInterop(Ionicons, {
	className: {
		target: "style",
		nativeStyleToProp: { height: true, width: true, size: true },
	},
})

type TabType = "new" | "suggestions"

interface FriendRequestItemProps {
	item: FriendRequest
	onProfilePress: (user: Profile) => void
	onRespondPress: (requestId: string, action: "accept" | "reject") => void
}

interface FriendSuggestionItemProps {
	item: Profile
	onProfilePress: (user: Profile) => void
	onRespondPress: (requestId: string, action: "accept" | "reject") => void
}

interface FriendModalProps {
	user: Profile | null
	visible: boolean
	onClose: () => void
}

const InfoRow = ({ icon, label, value, last = false }: any) => {
	return (
		<View
			className={clsx("px-4 py-3 flex-row items-center border-border gap-4", !last && "border-b")}
		>
			<Feather name={icon} size={18} className="text-muted" />
			<Text className="flex-1 text-sm text-textSecondary">{label}</Text>
			<Text className="text-sm text-textPrimary">{value}</Text>
		</View>
	)
}

const FriendModal = ({ user, visible, onClose }: FriendModalProps) => {
	const uri = user?.avatar_url

	return (
		<Modal visible={visible} animationType="slide" transparent={true}>
			<View className="flex-1 bg-black/50 justify-end">
				<View className="items-center">
					<Image
						className={`w-28 h-28 rounded-full border-4 border-primary mb-[-40] z-10 ${!uri && "bg-primary"}`}
						source={uri ? { uri } : require("../../../assets/images/avatar.png")}
					/>
				</View>

				<View className="bg-primary rounded-t-2xl pt-16 px-5 min-h-[45%] items-center">
					<TouchableOpacity
						className="absolute top-4 right-4 bg-gray-300 rounded-full z-20"
						onPress={onClose}
					>
						<Ionicons name="close-outline" size={20} className="text-onPrimary p-1" />
					</TouchableOpacity>
					<Text className="text-2xl text-surface font-bold mb-1">{user?.name}</Text>
					<Text className="text-base text-border mb-6">{user?.bio}</Text>

					<View className="w-full p-3 mb-8 bg-surface rounded-xl">
						<InfoRow icon="mail" label="Email" value={user?.email || "---"} />
						<InfoRow icon="globe" label="Website" value={user?.website || "---"} />
						<InfoRow icon="github" label="Github" value={user?.github || "---"} last={true} />
					</View>

					<View className="flex-row w-full gap-3">
						<TouchableOpacity className="flex-1 flex-row justify-center items-center py-4 gap-4 bg-red-100 rounded-full">
							<Ionicons name="trash-outline" size={20} className="text-error" />
							<Text className="text-base text-error font-semibold">Delete</Text>
						</TouchableOpacity>
						<TouchableOpacity className="flex-1 flex-row justify-center items-center py-4 gap-4 bg-green-100 rounded-full">
							<Ionicons name="checkmark-outline" size={20} className="text-secondary" />
							<Text className="text-base text-secondary font-semibold">Accept</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	)
}

const FriendRequestItem = ({ item, onProfilePress, onRespondPress }: FriendRequestItemProps) => {
	const requestId = item.id
	const from = item.from
	const uri = from?.avatar_url

	return (
		<View className="flex-row items-center px-1 py-4 border-b border-border">
			<TouchableOpacity
				className="flex-1 flex-row items-center"
				onPress={() => onProfilePress(from)}
			>
				<Image
					className={`w-12 h-12 rounded-full mr-4 ${!uri && "bg-primary"}`}
					source={uri ? { uri } : require("../../../assets/images/avatar.png")}
				/>
				<View className="flex-1">
					<Text className="text-lg font-semibold text-onSurface mb-1">{from?.name}</Text>
					<Text className="text-sm text-muted">{from?.bio}</Text>
				</View>
			</TouchableOpacity>
			<View className="flex-row items-center gap-4">
				<TouchableOpacity
					className="border border-error bg-red-100 rounded-full"
					onPress={() => onRespondPress(requestId, "reject")}
				>
					<Ionicons name="trash-outline" size={20} className="text-error p-2" />
				</TouchableOpacity>
				<TouchableOpacity
					className="border border-secondary bg-green-100 rounded-full"
					onPress={() => onRespondPress(requestId, "accept")}
				>
					<Ionicons name="checkmark-outline" size={20} className="text-secondary p-2" />
				</TouchableOpacity>
			</View>
		</View>
	)
}

const FriendSuggestionItem = ({ item, onProfilePress }: FriendSuggestionItemProps) => {
	const uri = item?.avatarUrl

	return (
		<View className="flex-row items-center px-1 py-4 border-b border-border">
			<TouchableOpacity
				className="flex-1 flex-row items-center"
				onPress={() => onProfilePress(item)}
			>
				<Image
					className={`w-12 h-12 rounded-full mr-4 ${!uri && "bg-primary"}`}
					source={uri ? { uri } : require("../../../assets/images/avatar.png")}
				/>
				<View className="flex-1">
					<Text className="text-lg font-semibold text-onSurface mb-1">{item?.name}</Text>
					<Text className="text-sm text-muted">{item?.bio}</Text>
				</View>
			</TouchableOpacity>
			<View className="flex-row items-center gap-4">
				<TouchableOpacity className="border border-error bg-red-100 rounded-full">
					<Ionicons name="remove-outline" size={20} className="text-error p-2" />
				</TouchableOpacity>
				<TouchableOpacity className="border border-primary bg-purple-100 rounded-full">
					<Ionicons name="person-add-outline" size={20} className="text-primary p-2" />
				</TouchableOpacity>
			</View>
		</View>
	)
}

const Community = () => {
	const [showInfo, setShowInfo] = useState<boolean>(false)
	const [selectedTab, setSelectedTab] = useState<TabType>("new")
	const [selectedRequest, setSelectedRequest] = useState<Profile | null>(null)

	const { respondFriendRequest } = useFriendSocketStore()
	const friendRequests = useFriendStore((state) => state.friendRequests)
	const friendSuggestions = useFriendStore((state) => state.friendSuggestions)

	useEffect(() => {
		useFriendStore.getState().fetchFriendRequests()
		useFriendStore.getState().fetchFriendSuggestions()
	}, [])

	const handleProfilePress = (user: Profile): void => {
		setSelectedRequest(user)
		setShowInfo(true)
	}

	const handleRespondFriendRequest = (requestId: string, action: "accept" | "reject") => {
		respondFriendRequest(requestId, action)
	}

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["left", "right"]}>
			<View className="flex-1 px-4 py-6">
				{/* Toggle Buttons */}
				<View className="flex-row mb-5 rounded-full bg-surface">
					<TouchableOpacity
						className={`flex-1 py-3 rounded-full ${selectedTab === "new" && "bg-primary"}`}
						onPress={() => setSelectedTab("new")}
					>
						<Text
							className={`text-center font-medium ${selectedTab === "new" ? "text-onPrimary" : "text-onSurface"}`}
						>
							New Requests ({friendRequests.length})
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`flex-1 py-3 rounded-full ${selectedTab === "suggestions" && "bg-primary"}`}
						onPress={() => setSelectedTab("suggestions")}
					>
						<Text
							className={`text-center font-medium ${selectedTab === "suggestions" ? "text-onPrimary" : "text-onSurface"}`}
						>
							Suggestions
						</Text>
					</TouchableOpacity>
				</View>

				{selectedTab === "new" &&
					(friendRequests.length === 0 ? (
						<View className="flex-1 items-center justify-center">
							<Text className="text-center text-muted">No friend requests found</Text>
						</View>
					) : (
						<FlatList
							data={friendRequests}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<FriendRequestItem
									key={item.id}
									item={item}
									onProfilePress={handleProfilePress}
									onRespondPress={handleRespondFriendRequest}
								/>
							)}
						/>
					))}

				{/* TODO: Clean up friend suggestions */}
				{selectedTab === "suggestions" &&
					(friendSuggestions.length === 0 ? (
						<View className="flex-1 items-center justify-center">
							<Text className="text-center text-muted">No friend suggestions</Text>
						</View>
					) : (
						<FlatList
							data={friendSuggestions}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<FriendSuggestionItem
									key={item.id}
									item={item}
									onProfilePress={handleProfilePress}
									onRespondPress={handleRespondFriendRequest}
								/>
							)}
						/>
					))}
			</View>

			<FriendModal user={selectedRequest} visible={showInfo} onClose={() => setShowInfo(false)} />
		</SafeAreaView>
	)
}

export default Community
