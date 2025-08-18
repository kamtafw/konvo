import * as chatService from "@/services/chat"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type ChatState = {
	chats: Chat[]
	loading: boolean
	error: string | null
	lastFetchedAt: number | null
	hydrated: boolean

	fetchChats: (opts?: { force?: boolean; maxAgeMs?: number }) => Promise<void>
	upsertChat: (chat: Chat) => void
	removeChat: (chatId: string) => void
	markChatRead: (chatId: string) => void
	reset: () => void
}

export const useChatStore = create(
	persist<ChatState>(
		(set, get) => ({
			chats: [],
			loading: false,
			error: null,
			lastFetchedAt: null,
			hydrated: false,

			fetchChats: async ({ force = false, maxAgeMs = 30_000 } = {}) => {
				const { lastFetchedAt, chats } = get()
				const isStale = !lastFetchedAt || Date.now() - lastFetchedAt > maxAgeMs

				if (!force && chats.length > 0 && !isStale) return

				set({ loading: true, error: null })
				try {
					const data = await chatService.getChats()
					set({
						chats: data,
						lastFetchedAt: Date.now(),
					})
				} catch (e: any) {
					set({ error: e?.message || "Failed to load chats" })
				} finally {
					set({ loading: false })
				}
			},

			upsertChat: (chat) => {
				set((state) => {
					const idx = state.chats.findIndex((c) => c.id === chat.id)
					if (idx !== -1) {
						const updated = [...state.chats]
						updated[idx] = { ...updated[idx], ...chat }
						return { chats: updated }
					}
					return { chats: [chat, ...state.chats] }
				})
			},

			removeChat: (chatId) => {
				set((state) => ({
					chats: state.chats.filter((c) => c.id !== chatId),
				}))
			},

			markChatRead: (chatId) => {
				set((state) => ({
					chats: state.chats.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)),
				}))
			},

			reset: () =>
				set({
					chats: [],
					loading: false,
					error: null,
					lastFetchedAt: null,
					hydrated: false,
				}),
		}),
		{
			name: "chats-storage",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				chats: state.chats,
				lastFetchedAt: state.lastFetchedAt,
			}),
			onRehydrateStorage: () => async (state) => {
				if (!state) return

				const { lastFetchedAt, chats } = state
				const isStale = !lastFetchedAt || Date.now() - lastFetchedAt > 30_000

				if (!chats || chats.length === 0 || isStale) {
					await state.fetchChats?.({ force: false })
				}

				set({ hydrated: true })
			},
		}
	)
)
