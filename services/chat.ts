import { api, ENDPOINTS } from "@/api"

export const getChats = async () => {
	const response = await api.get(ENDPOINTS.CHATS)
	return response.data
}

export const getMessages = async (chatId: string) => {
	const response = await api.post(ENDPOINTS.MESSAGES(chatId))
	return response.data
}
