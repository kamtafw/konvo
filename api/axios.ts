import { useAuthStore } from "@/stores/authStore"
import axios from "axios"
import { ENDPOINTS } from "./endpoints"

const BASE_URL = `http://${ENDPOINTS.IPV4}:8000/api/`
// const BASE_URL = "http://10.188.0.34:8000/api/"


const api = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	// headers: {
	// 	"Content-Type": "application/json",
	// },
})

api.interceptors.request.use(
	async (config) => {
		const access = useAuthStore.getState().access
		if (access) {
			config.headers.Authorization = `Bearer ${access}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     // Optional: Handle token expiration, refresh, etc
//     if (error.response?.status === 401) {
//       // logout or refresh logic here
//       console.warn('Unauthorized! You might want to log out.');
//     }
//     return Promise.reject(error);
//   }
// );

export default api
