import {Link} from "expo-router";
import {Image, Text, TouchableOpacity, View} from "react-native";

const ChatCard = ({id, avatar, name, lastMessage}: any) => {
    return (
        <Link href={`/chat/${id}`} asChild>
            <TouchableOpacity className="flex-row items-center py-4 border-b border-zinc-300 dark:border-zinc-700">
                <Image
                    className="w-12 h-12 rounded-full mr-4"
                    source={{uri: avatar}}
                />

                <View className="flex-1">
                    <Text className="text-base font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
                        {name}
                    </Text>
                    <Text
                        className="text-sm text-zinc-500 dark:text-zinc-400"
                        numberOfLines={1}
                    >
                        {lastMessage.type === "voice"
                            ? "[Voice note]"
                            : lastMessage.content}
                    </Text>
                </View>

                <Text className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">
                    {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}{" "}
                </Text>
            </TouchableOpacity>
        </Link>
    );
};

export default ChatCard;
