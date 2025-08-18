import * as authService from "@/services/auth"
import * as SecureStore from "expo-secure-store"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useChatStore } from "./chatStore"
import { useProfileStore } from "./profileStore"

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

type User = {
	id: string
	name: string
	phone: string
}

type AuthState = {
	user: User | null
	access: string | null
	refresh: string | null

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

			// SIGNUP
			signup: async (payload) => {
				const { user, access, refresh } = await authService.signup(payload)
				set({ user, access, refresh })
				await useProfileStore.getState().fetchProfile({ force: true })
			},

			// LOGIN
			login: async (payload) => {
				const { user, access, refresh } = await authService.login(payload)
				set({ user, access, refresh })
				await useProfileStore.getState().fetchProfile({ force: true })
				await useChatStore.getState().fetchChats({ force: true })
			},

			// LOGOUT
			logout: () => {
				set({ user: null, access: null, refresh: null })
				useProfileStore.getState().reset()
				useChatStore.getState().reset()
			},

			// REFRESH TOKEN
			refreshToken: async () => {
				const refresh = get().refresh
				if (!refresh) return

				try {
					const { access } = await authService.refreshToken(refresh)
					set({ access })
					const data = await authService.getUserProfile()
					set({ user: data })
					await useProfileStore.getState().fetchProfile({ force: true })
					await useChatStore.getState().fetchChats({ force: true })
				} catch {
					get().logout()
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
			}),
		}
	)
)
// export const useTodo = (id: string)=>useTodoStore((state) => state.todos.find((todo) => todo.id === id)
