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
	bio: string
	name: string
	phone: string
	email: string
	github: string
	website: string

	avatarUrl: string
	dateJoined: string
	mutualFriendsCount: number

	avatar_url: string
	date_joined: string
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
