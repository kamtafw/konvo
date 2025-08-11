export const ENDPOINTS = {
	LOGIN: "accounts/login/",
	SIGNUP: "accounts/signup/",
	USER: "accounts/me/",
	CONVERSATIONS: "chats/",
	MESSAGES: (convoId: string) => `chats/${convoId}/messages/`,
	MARK_CONVO_READ: (msgId: string) => `chats/messages/${msgId}/read/`,
}
