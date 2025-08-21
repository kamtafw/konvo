type Participant = {
	id: string
	phone: string
	name: string
	avatar_url: string
}

type Message = {
	id: string
	sender: Participant
	text: string
	created_at: string
	is_read: boolean
}

interface Chat {
	id: string
	participants: Participant[]
	created_at: string
	last_message: Message | null
	unread_count: number
	pinned?: boolean
	typing?: boolean
}

interface Profile {
	id: string
	name: string
	avatar_url: string
	phone: string
	email: string
	bio: string
	website: string
	github: string
	date_joined: string
}

type MessageStatus = "sent" | "delivered" | "read"

interface Message2 {
	id: string
	sender: string // could be `User["id"]` if you're strict
	content: string
	timestamp: string
	status: MessageStatus
}

// interface Chat {
// 	id: string
// 	participants: string[] // array of user IDs
// 	pinned?: boolean
// 	typing?: boolean
// 	messages: Message[]
// }
