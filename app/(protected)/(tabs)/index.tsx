import FloatingAB from "@/components/FloatingAB"
import { chats, users } from "@/data/mock"
import { Entypo } from "@expo/vector-icons"
import clsx from "clsx"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { router } from "expo-router"
import { cssInterop } from "nativewind"
import { useMemo, useState } from "react"
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

dayjs.extend(relativeTime)

cssInterop(Entypo, {
    className: {
        target: "style",
        nativeStyleToProp: { height: true, width: true, size: true },
    },
})

const userId = "u1"
type Chat = (typeof chats)[number]

const ChatList = () => {
    const [localChats, setLocalChats] = useState(chats)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredChats = useMemo(() => {
        return [...localChats]
            .filter((chat) => {
                const friendsIds = chat.participants.filter((id) => id !== userId)
                const displayName = friendsIds
                    .map((id) => users[id]?.name || "")
                    .join(", ")
                    .toLowerCase()
                const lastMsg = chat.messages.at(-1)?.content?.toLowerCase() || ""
                const query = searchQuery.toLowerCase()
                return displayName.includes(query) || lastMsg.includes(query)
            })
            .sort((a, b) => {
                const pinnedDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
                if (pinnedDiff !== 0) return pinnedDiff

                const aTime = new Date(a.messages.at(-1)?.timestamp || 0).getTime()
                const bTime = new Date(b.messages.at(-1)?.timestamp || 0).getTime()
                return bTime - aTime
            })
    }, [localChats, searchQuery])

    const renderItem = ({ item }: { item: Chat }) => {
        const friendId = item.participants.find((id) => id !== userId)!
        const friend = users[friendId]
        const displayName = friend.name || "Unknown"
        const avatarUri = friend.avatar || "https://ui-avatars.com/api/?name=User&background=aaa"
        const lastMessage = item.messages.at(-1)!
        const unreadCount = item.messages.filter(
            (m) => m.sender !== userId && m.status !== "read"
        ).length
        const isTyping = item.typing
        const isPinned = item.pinned

        return (
            // <Link href={`/chat/${item.id}`} asChild>
            <TouchableOpacity
                onPress={() => router.push(`/chat/${item.id}`)}
                className="flex-row items-center p-4 border-b border-border bg-surface"
            >
                {/* Avatar */}
                <Image className="w-12 h-12 rounded-full mr-4" source={{ uri: avatarUri }} />

                {/* Name + Last Message or Typing */}
                <View className="flex-1">
                    <Text className="text-onSurface text-base font-semibold">{displayName}</Text>

                    <Text
                        className={clsx("text-sm", isTyping ? "text-primary" : " text-onSurface")}
                        numberOfLines={1}
                    >
                        {isTyping ? "typing..." : lastMessage.content}
                    </Text>
                </View>

                <View className="flex-row items-center">
                    <View className={clsx("flex items-end gap-1", isPinned && "mr-2")}>
                        <Text className="text-xs text-muted">
                            {lastMessage?.timestamp ? dayjs(lastMessage.timestamp).fromNow() : ""}
                            {/*{new Date(lastMessage.timestamp).toLocaleTimeString([], {*/}
                            {/*    hour: "2-digit",*/}
                            {/*    minute: "2-digit",*/}
                            {/*})}*/}
                        </Text>

                        {!isTyping && lastMessage?.sender === userId && (
                            <Text className="text-xs text-muted">
                                {lastMessage.status === "sent" ? "✓" : "✓✓"}
                            </Text>
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
        <SafeAreaView className="flex-1 pt-6 bg-background" edges={["left", "right"]}>
            <TextInput
                placeholder="Search chats or users"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="mx-4 mb-4 p-4 rounded-3xl bg-surface text-onSurface"
                placeholderTextColor="#888"
            />

            <FlatList
                data={filteredChats}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                className="bg-background"
            />

            <FloatingAB />
        </SafeAreaView>
    )
}

export default ChatList
