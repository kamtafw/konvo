import * as SecureStore from "expo-secure-store"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import * as authService from "../services/authService"

// SecureStore adapter for zustand persist
const secureStorage = {
	getItem: async (name: string) => {
		const value = await SecureStore.getItemAsync(name)
		return value ?? null
	},
	setItem: async (name: string, value: string) => {
		await SecureStore.setItemAsync(name, value)
	},
	removeItem: async (name: string) => {
		await SecureStore.deleteItemAsync(name)
	},
}

type AuthState = {
	user: User | null
	access: string | null
	refresh: string | null
	error: string | null
	loading: boolean

	signup: (payload: any) => Promise<void>
	login: (payload: any) => Promise<void>
	refreshToken: () => Promise<void>
	logout: () => void
}

export const useAuthStore = create(
	persist<AuthState>(
		(set, get) => ({
			user: null,
			access: null,
			refresh: null,
			error: null,
			loading: false,

			// SIGNUP
			signup: async (payload) => {
				set({ loading: true, error: null })
				try {
					const { access, refresh } = await authService.signup(payload)
					set({ access, refresh })
				} catch (err: any) {
					set({ error: err || "Signup failed." })
				} finally {
					set({ loading: false })
				}
			},

			// LOGIN
			login: async (payload) => {
				set({ loading: true, error: null })
				try {
					const { access, refresh } = await authService.login(payload)
					set({ access, refresh })
				} catch (err: any) {
					set({ error: err || "Login failed." })
				} finally {
					set({ loading: false })
				}
			},

			// LOGOUT
			logout: () => set({ user: null, access: null, refresh: null }),

			// REFRESH TOKEN
			refreshToken: async () => {
				set({ loading: true, error: null })

				const refresh = get().refresh
				if (!refresh) return

				try {
					const { access } = await authService.refreshToken(refresh)
					set({ access })
				} catch {
					set({ user: null, access: null, refresh: null, error: "Login failed." })
				} finally {
					set({ loading: false })
				}
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => secureStorage),
			partialize: (state) => ({
				user: state.user,
				access: state.access,
				refresh: state.refresh,
				loading: state.loading,
				error: state.error,
			}),
		}
	)
)
// export const useTodo = (id: string)=>useTodoStore((state) => state.todos.find((todo) => todo.id === id)
