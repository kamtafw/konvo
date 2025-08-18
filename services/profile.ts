import { api, ENDPOINTS } from "@/api"

export const getMe = async () => {
	const response = await api.get(ENDPOINTS.ME)
	return response.data
}
