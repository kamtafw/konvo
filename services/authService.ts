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

export const getMe = async () => {
	const response = await api.get(ENDPOINTS.USER)
	return response.data
}
