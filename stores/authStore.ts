import { deleteItemAsync, getItem, setItem } from "expo-secure-store"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import * as authService from "../services/authService"

type AuthState = {
	user: User | null
	access: string | null
	refresh: string | null
	isLoading: boolean
	error: string | null

	signup: (payload: any) => Promise<void>
	login: (payload: any) => Promise<void>
	logout: () => void
	restoreSession: () => Promise<void>
}

export const useAuthStore = create(
	persist<AuthState>(
		(set, get) => ({
			user: null,
			access: null,
			refresh: null,
			isLoading: false,
			error: null,

			signup: async (payload) => {
				set({ isLoading: true, error: null })
				try {
					const response = await authService.signup(payload)
					set({ user: response.user, access: response.access })
				} catch (err: any) {
					set({ error: err || "Signup failed." })
				} finally {
					set({ isLoading: false })
				}
			},
			login: async (payload) => {
				set({ isLoading: true, error: null })
				try {
					const response = await authService.login(payload)
					set({ user: response.user, access: response.access })
				} catch (err: any) {
					set({ error: err || "Login failed." })
				} finally {
					set({ isLoading: false })
				}
			},
			logout: () => set({ user: null, access: null, refresh: null }),
			restoreSession: async () => {
				const access = get().access
				if (access) {
					try {
						const user = await authService.getMe()
						set({ user })
					} catch {
						set({ access: null, refresh: null, user: null })
					}
				}
			},
		}),
		{
			name: "auth-store",
			storage: createJSONStorage(() => ({
				setItem,
				getItem,
				removeItem: deleteItemAsync,
			})),
			partialize: (state) => ({
				user: state.user,
				access: state.access,
				refresh: state.refresh,
				isLoading: state.isLoading,
				error: state.error,
			}),
		}
	)
)
// export const useTodo = (id: string)=>useTodoStore((state) => state.todos.find((todo) => todo.id === id)
