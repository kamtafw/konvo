export const ENDPOINTS = {
	IPV4: "10.31.9.34",

	LOGIN: "accounts/login/",
	SIGNUP: "accounts/signup/",
	ME: "accounts/me/",
	REFRESH_TOKEN: "accounts/refresh/",
	CHATS: "chats/",
	UPLOAD_AVATAR: "accounts/avatar/",
	START_CONVO: "chats/start/",
	MESSAGES: (chatId: string) => `chats/${chatId}/messages/`,
	MARK_READ: (chatId: string) => `chats/${chatId}/mark-read/`,

	FRIEND_LIST: "friends/",
	FRIEND_REQUESTS: "friends/requests/",
	FRIEND_SUGGESTIONS: "friends/suggestions/",
	SEND_FRIEND_REQUEST: "friends/requests/create/",
	RESPOND_FRIEND_REQUEST: (requestId: string) => `friends/requests/${requestId}/respond/`,
}
