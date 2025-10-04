import * as authService from "@/services/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useChatSocketStore } from "./chatSocketStore"
import { useChatStore } from "./chatStore"
import { useFriendSocketStore } from "./friendSocketStore"
import { useFriendStore } from "./friendStore"
import { usePresenceSocketStore } from "./presenceSocketStore"
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
				// first disconnect any existing WebSocket
				useChatSocketStore.getState().disconnect()
				useFriendSocketStore.getState().disconnect()
				usePresenceSocketStore.getState().disconnect()

				const { user, access, refresh } = await authService.login(payload)
				console.log(`#AUTH Login successful for user: ${user.id}`)

				set({ user, access, refresh })

				await useProfileStore.getState().fetchProfile({ force: true })
				await useChatStore.getState().fetchChats({ force: true })
				await useFriendStore.getState().fetchFriendList({ force: true })

				console.log(`#AUTH Login complete for user: ${user.id}`)
			},

			// LOGOUT
			logout: () => {
				console.log(`#AUTH Logging out user: ${get().user?.id}`)

				// disconnect WebSocket first
				useChatSocketStore.getState().disconnect()
				useFriendSocketStore.getState().disconnect()
				usePresenceSocketStore.getState().disconnect()

				// clear auth state
				set({ user: null, access: null, refresh: null })

				// reset stores
				useProfileStore.getState().reset()
				useChatStore.getState().reset()
				useFriendStore.getState().reset()

				// clear persisted storage
				Promise.all([
					SecureStore.deleteItemAsync("auth-storage").catch(() => {}),
					AsyncStorage.removeItem("chats-storage").catch(() => {}),
					AsyncStorage.removeItem("friends-storage").catch(() => {}),
					AsyncStorage.removeItem("profile-storage").catch(() => {}),
				]).then(() => {
					console.log(`#AUTH Logout complete, all storage cleared`)
				})
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
