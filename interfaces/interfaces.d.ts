type Participant = {
	id: string
	phone: string
	name: string
	avatar_url: string
}

type Message = {
	id: string
	sender: Participant | string
	text: string
	created_at: string
	read_at?: string
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
	avatarUrl: string
	dateJoined: string
}

interface Friend {
	id: string
	friend: Profile
	createdAt: string
}

interface FriendRequest {
	id: string
	from: Profile
	to?: Profile
	createdAt: string
}
