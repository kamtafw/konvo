export const ENDPOINTS = {
	LOGIN: "accounts/login/",
	SIGNUP: "accounts/signup/",
	ME: "accounts/me/",
	REFRESH_TOKEN: "accounts/refresh/",
	CHATS: "chats/",
	UPLOAD_AVATAR: "accounts/avatar/",
	MESSAGES: (chatId: string) => `chats/${chatId}/messages/`,
	MARK_CONVO_READ: (msgId: string) => `chats/messages/${msgId}/read/`,
}
