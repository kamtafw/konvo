import { api, ENDPOINTS } from "@/api"

export const getChats = async () => {
	const response = await api.get(ENDPOINTS.CHATS)
	return response.data
}

export const startChat = async (targetId: string) => {
	const response = await api.post(ENDPOINTS.START_CONVO, { target_id: targetId })
	return response.data
}

export const getMessages = async (chatId: string) => {
	const response = await api.get(ENDPOINTS.MESSAGES(chatId))
	return response.data
}

export const markChatAsRead = async (chatId: string) => {
	const response = await api.post(ENDPOINTS.MARK_READ(chatId))
	return response.data
}
