export const users: Record<string, User> = {
	u1: {
		id: "u1",
		name: "Tiva",
		avatar: "https://i.pravatar.cc/150?img=1",
	},
	u2: {
		id: "u2",
		name: "Sam",
		avatar: "https://i.pravatar.cc/150?img=2",
	},
	u3: {
		id: "u3",
		name: "Ada",
		avatar: "https://i.pravatar.cc/150?img=3",
	},
	u4: {
		id: "u4",
		name: "Malik",
		avatar: "https://i.pravatar.cc/150?img=4",
	},
	u5: {
		id: "u5",
		name: "Zara",
		avatar: "https://i.pravatar.cc/150?img=5",
	},
	u6: {
		id: "u6",
		name: "Chuka",
		avatar: "https://i.pravatar.cc/150?img=6",
	},
}

export const chats: Chat[] = [
	{
		id: "u2",
		participants: ["u1", "u2"],
		messages: [
			{
				id: "m1",
				sender: "u2",
				content: "Yo Tiva! You there?",
				timestamp: "2025-07-27T12:00:00Z",
				status: "read",
			},
			{
				id: "m2",
				sender: "u1",
				content: "Yeah man, what’s up?",
				timestamp: "2025-07-27T12:01:00Z",
				status: "read",
			},
			{
				id: "m3",
				sender: "u2",
				content: "Got something cool to show you ⚡️",
				timestamp: "2025-07-27T12:02:00Z",
				status: "read",
			},
			{
				id: "m4",
				sender: "u2",
				content: "There's this scripture!",
				timestamp: "2025-07-28T12:04:00Z",
				status: "read",
			},
			{
				id: "m5",
				sender: "u1",
				content: "Please share",
				timestamp: "2025-07-30T13:14:00Z",
				status: "sent",
			},
		],
	},
	{
		id: "u3",
		participants: ["u1", "u3"],
		messages: [
			{
				id: "m6",
				sender: "u3",
				content: "Hey Tiva! How did the demo go?",
				timestamp: "2025-07-28T09:22:00Z",
				status: "read",
			},
			{
				id: "m7",
				sender: "u1",
				content: "Killed it 😎 They loved the KonVo mockup!",
				timestamp: "2025-07-28T09:25:00Z",
				status: "read",
			},
			{
				id: "m8",
				sender: "u3",
				content: "Yessss! 🙌",
				timestamp: "2025-07-28T09:27:00Z",
				status: "read",
			},
		],
	},
	{
		id: "u4",
		participants: ["u1", "u4"],
		messages: [
			{
				id: "m9",
				sender: "u4",
				content: "Bro you still up?",
				timestamp: "2025-07-29T02:45:00Z",
				status: "delivered",
			},
			{
				id: "m10",
				sender: "u4",
				content: "Need your eyes on this new layout",
				timestamp: "2025-07-29T02:47:00Z",
				status: "delivered",
			},
		],
	},
	{
		id: "u5",
		participants: ["u1", "u5"],
		pinned: true,
		messages: [
			{
				id: "m11",
				sender: "u5",
				content: "This design is fire 🔥",
				timestamp: "2025-07-30T08:15:00Z",
				status: "read",
			},
			{
				id: "m12",
				sender: "u1",
				content: "Thanks! Trying something new this sprint.",
				timestamp: "2025-07-30T08:18:00Z",
				status: "read",
			},
		],
	},
	{
		id: "u6",
		participants: ["u1", "u6"],
		typing: true,
		messages: [
			{
				id: "m13",
				sender: "u1",
				content: "Yo Chuka, seen the quote feature yet?",
				timestamp: "2025-07-30T09:00:00Z",
				status: "read",
			},
		],
	},
]

export const requests: Friend[] = [
	{
		id: "u1",
		name: "Dauda",
		avatar_url: "https://i.pravatar.cc/150?img=1",
	},
	{
		id: "u2",
		name: "Adams",
		avatar_url: "https://i.pravatar.cc/150?img=2",
	},
	{
		id: "u3",
		name: "Godwin",
		avatar_url: "https://i.pravatar.cc/150?img=3",
	},
	{
		id: "u4",
		name: "Ding",
		avatar_url: "https://i.pravatar.cc/150?img=4",
	},
	{
		id: "u5",
		name: "Shaks",
		avatar_url: "https://i.pravatar.cc/150?img=5",
	},
	{
		id: "u6",
		name: "Tosin",
		avatar_url: "https://i.pravatar.cc/150?img=6",
	},
]
