import * as chatService from "@/services/chat"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface Chat {
	id: string
	participants: Participant[]
	created_at: string
	last_message: Message | null
	unread_count: number
	pinned?: boolean
	typing?: boolean
}

type ChatState = {
	chats: Chat[]
	messages: Record<string, Message[]> // key: chatId
	loadingChats: boolean
	loadingMessages: Record<string, boolean>
	error: string | null
	lastFetchedChatsAt: number | null
	lastFetchedMessagesAt: Record<string, number>
	hydrated: boolean

	fetchChats: (opts?: { force?: boolean; maxAgeMs?: number }) => Promise<void>
	fetchMessages: (chatId: string, opts?: { force?: boolean; maxAgeMs?: number }) => Promise<void>
	upsertChat: (chat: Chat) => void
	removeChat: (chatId: string) => void
	addMessage: (chatId: string, message: Message) => void
	upsertMessage: (chatId: string, message: Message) => void
	replaceMessages: (chatId: string, messages: Message[]) => void
	markChatRead: (chatId: string) => void
	reset: () => void
}

export const useChatStore = create(
	persist<ChatState>(
		(set, get) => ({
			chats: [],
			messages: {},
			loadingChats: false,
			loadingMessages: {},
			error: null,
			lastFetchedChatsAt: null,
			lastFetchedMessagesAt: {},
			hydrated: false,

			fetchChats: async ({ force = false, maxAgeMs = 30_000 } = {}) => {
				const { lastFetchedChatsAt, chats } = get()
				const isStale = !lastFetchedChatsAt || Date.now() - lastFetchedChatsAt > maxAgeMs
				if (!force && chats.length > 0 && !isStale) return

				set({ loadingChats: true, error: null })
				try {
					const data = await chatService.getChats()
					set({ chats: data, lastFetchedChatsAt: Date.now() })
				} catch (e: any) {
					set({ error: e?.message || "Failed to load chats" })
				} finally {
					set({ loadingChats: false })
				}
			},

			fetchMessages: async (chatId, { force = false, maxAgeMs = 30_000 } = {}) => {
				const { lastFetchedMessagesAt, messages } = get()
				const lastFetchedAt = lastFetchedMessagesAt[chatId]
				const isStale = !lastFetchedAt || Date.now() - lastFetchedAt > maxAgeMs
				if (!force && messages[chatId]?.length > 0 && !isStale) return

				set((state) => ({
					loadingMessages: { ...state.loadingMessages, [chatId]: true },
					error: null,
				}))
				try {
					const data = await chatService.getMessages(chatId)
					set((state) => ({
						messages: { ...state.messages, [chatId]: data },
						lastFetchedMessagesAt: { ...state.lastFetchedMessagesAt, [chatId]: Date.now() },
					}))
				} catch (e: any) {
					set({ error: e?.message || `Failed to load messages for chat ${chatId}` })
				} finally {
					set((state) => ({
						loadingMessages: { ...state.loadingMessages, [chatId]: false },
					}))
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
					messages: Object.fromEntries(
						Object.entries(state.messages).filter(([id]) => id !== chatId)
					),
				}))
			},

			addMessage: (chatId, message) => {
				set((state) => {
					const existing = state.messages[chatId] || []
					return {
						messages: {
							...state.messages,
							[chatId]: [...existing, message],
						},
						chats: state.chats.map((c) =>
							c.id === chatId
								? {
										...c,
										last_message: message,
										unread_count: c.unread_count + 1,
									}
								: c
						),
					}
				})
			},

			upsertMessage: (chatId, message) => {
				set((state) => {
					const msgs = state.messages[chatId] || []
					const idx = msgs.findIndex((m) => m.id === message.id)
					if (idx !== -1) {
						const updated = [...msgs]
						updated[idx] = { ...updated[idx], ...message }
						return { messages: { ...state.messages, [chatId]: updated } }
					}
					return {
						messages: { ...state.messages, [chatId]: [...msgs, message] },
					}
				})
			},

			replaceMessages: (chatId, messages: Message[]) => {
				set((state) => ({
					messages: { ...state.messages, [chatId]: messages },
				}))
			},

			markChatRead: (chatId) => {
				set((state) => ({
					chats: state.chats.map((c) => (c.id === chatId ? { ...c, unread_count: 0 } : c)),
					messages: {
						...state.messages,
						[chatId]: (state.messages[chatId] || []).map((m) => ({
							...m,
							is_read: true,
						})),
					},
				}))
			},

			reset: () =>
				set({
					chats: [],
					messages: {},
					loadingChats: false,
					loadingMessages: {},
					error: null,
					lastFetchedChatsAt: null,
					lastFetchedMessagesAt: {},
					hydrated: false,
				}),
		}),
		{
			name: "chats-storage",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				chats: state.chats,
				messages: state.messages,
				lastFetchedChatsAt: state.lastFetchedChatsAt,
				lastFetchedMessagesAt: state.lastFetchedMessagesAt,
			}),
			onRehydrateStorage: () => async (state) => {
				if (!state) return

				const { lastFetchedChatsAt, chats } = state
				const isStale = !lastFetchedChatsAt || Date.now() - lastFetchedChatsAt > 30_000

				if (!chats || chats.length === 0 || isStale) {
					await state.fetchChats?.({ force: false })
				}

				set({ hydrated: true })
			},
		}
	)
)
