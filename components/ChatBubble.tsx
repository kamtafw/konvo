import {Text, View} from "react-native";

interface Props {
    message: Message;
    isOwn: boolean;
    sender: User;
}

const ChatBubble = ({message, isOwn, sender}: Props) => {
    const alignment = isOwn ? "items-end" : "items-start";
    const bg = isOwn ? "bg-primary" : "bg-surface";
    const textColor = isOwn ? "text-onPrimary" : "text-onSurface";

    return (
        <View className={`mb-3 ${alignment}`}>
            <View className={`rounded-xl px-4 py-2 ${bg} max-w-[75%]`}>
                <Text className={`${textColor}`}>{message.content}</Text>
            </View>

            {/* Timestamp + status */}
            <Text className="text-[10px] text-muted mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}{"   "}
                {isOwn ? (message.status === "sent" ? "✓" : "✓✓") : ""}
            </Text>
        </View>
    );
};

export default ChatBubble;
