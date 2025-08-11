interface User {
    id: string;
    name: string;
    avatar: string;
}

type MessageStatus = "sent" | "delivered" | "read";

interface Message {
    id: string;
    sender: string; // could be `User["id"]` if you're strict
    content: string;
    timestamp: string;
    status: MessageStatus;
}

interface Chat {
    id: string;
    participants: string[]; // array of user IDs
    pinned?: boolean;
    typing?: boolean;
    messages: Message[];
}
