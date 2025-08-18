import { api, ENDPOINTS } from "@/api"

type Account = {
	phone: string
	password: string
	name?: string
	email?: string
}

export const login = async ({ phone, password }: Account) => {
	const response = await api.post(ENDPOINTS.LOGIN, { phone, password })
	return response.data
}

export const signup = async ({ phone, password, name, email }: Account) => {
	let response = await api.post(ENDPOINTS.SIGNUP, { phone, password, name, email })
	if (response.status === 201) {
		const data = await login({ phone, password })
		return data
	}
	return response.data
}

export const refreshToken = async (refresh: string) => {
	const response = await api.post(ENDPOINTS.REFRESH_TOKEN, { refresh })
	return response.data
}

export const getUserProfile = async () => {
	const response = await api.get(ENDPOINTS.ME)
	return response.data
}

export const updateUserProfile = async (patch: Partial<Profile>) => {
	const response = await api.put(ENDPOINTS.ME, patch)
	return response.data
}

export const updateUserAvatar = async (form: FormData) => {
	const response = await api.post(ENDPOINTS.UPLOAD_AVATAR, form, {
		headers: { "Content-Type": "multipart/form-data" },
	})
	return response.data
}
