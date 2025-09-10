import { api, ENDPOINTS } from "@/api"

export const getFriendList = async () => {
	const response = await api.get(ENDPOINTS.FRIEND_LIST)
	return response.data
}

export const getFriendRequests = async () => {
	const response = await api.get(ENDPOINTS.FRIEND_REQUESTS)
	return response.data
}

export const getFriendSuggestions = async () => {
	const response = await api.get(ENDPOINTS.FRIEND_SUGGESTIONS)
	return response.data
}

export const sendFriendRequest = async (userId: string) => {
	const response = await api.post(ENDPOINTS.SEND_FRIEND_REQUEST, { to_user: userId })
	return response.data
}

export const respondFriendRequest = async (requestId: string, action: "accept" | "reject") => {
	const response = await api.post(ENDPOINTS.RESPOND_FRIEND_REQUEST(requestId), { action })
	return response.data
}
