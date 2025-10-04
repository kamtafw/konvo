import * as chatService from "@/services/chat"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useAuthStore } from "./authStore"

interface Chat {
	id: string
	participants: Participant[]
	last_message: Message | null
	unread_count: number
	created_at: string
	pinned?: boolean
}

type ChatState = {
	chats: Chat[]
	messages: Record<string, Message[]> // key: chatId
	loadingChats: boolean
	loadingMessages: Record<string, boolean>
	lastFetchedChatsAt: number | null
	lastFetchedMessagesAt: Record<string, number>
	typing: Record<string, object>
	typingTimers: Record<string, number>
	presence: Record<string, object>
	activeChatId: string | null
	error: string | null
	hydrated: boolean

	fetchChats: (opts?: { force?: boolean; maxAgeMs?: number }) => Promise<void>
	startChatLocal: (placeholderId: string, realChat: Chat) => void
	upsertChat: (chat: Chat) => void
	removeChat: (chatId: string) => void

	fetchMessages: (chatId: string, opts?: { force?: boolean; maxAgeMs?: number }) => Promise<void>
	addMessage: (chatId: string, message: Message) => void
	upsertMessage: (chatId: string, message: Message) => void
	replaceMessages: (chatId: string, messages: Message[]) => void
	markMessagesAsRead: (chatId: string, readerId: string) => void

	setActiveChat: (chatId: string | null) => void
	setTyping: (chatId: string, userId: string, typing: boolean) => void
	setPresence: (userId: string, status: "online" | "offline", last_seen: string | null) => void

	reset: () => void
}

export const useChatStore = create(
	persist<ChatState>(
		(set, get) => ({
			chats: [],
			messages: {},
			loadingChats: false,
			loadingMessages: {},
			lastFetchedChatsAt: null,
			lastFetchedMessagesAt: {},
			typing: {}, // {[chatId]: {[userId]: boolean}}
			typingTimers: {},
			presence: {}, // {[userId]: {status: "online"|"offline", last_seen: string}}
			activeChatId: null,
			error: null,
			hydrated: false,

			fetchChats: async ({ force = false, maxAgeMs = 60_000 } = {}) => {
				const { lastFetchedChatsAt, chats } = get()
				const isStale = !lastFetchedChatsAt || Date.now() - lastFetchedChatsAt > maxAgeMs
				if (!force && chats.length > 0 && !isStale) return

				set({ loadingChats: true, error: null })
				try {
					const data = await chatService.getChats()
					const normalized = data.map((c: any) => ({ ...c, id: String(c.id) }))
					set({ chats: normalized, lastFetchedChatsAt: Date.now() })
				} catch (e: any) {
					set({ error: e?.message || "Failed to load chats" })
				} finally {
					set({ loadingChats: false })
				}
			},

			startChatLocal: (placeholderId, realChat) => {
				set((state) => {
					// move messages from placeholderId to realChat.id
					const placeholderMessages = state.messages[placeholderId] || []
					const existingMessages = { ...state.messages }
					if (placeholderMessages.length) {
						existingMessages[realChat.id] = [...(existingMessages[realChat.id] || [])]
					}
					delete existingMessages[placeholderId]

					// replace chats array
					const chatsWithoutPlaceholder = state.chats.filter((c) => c.id !== placeholderId)
					const idx = chatsWithoutPlaceholder.findIndex((c) => String(c.id) === String(realChat.id))
					if (idx !== -1) {
						chatsWithoutPlaceholder[idx] = { ...chatsWithoutPlaceholder[idx], ...realChat }
						return { chats: chatsWithoutPlaceholder, messages: existingMessages }
					}
					return { chats: [realChat, ...chatsWithoutPlaceholder], messages: existingMessages }
				})
			},

			upsertChat: (chat) => {
				const chatId = String(chat.id)

				set((state) => {
					const idx = state.chats.findIndex((c) => String(c.id) === chatId)
					const active = state.activeChatId === chatId

					if (idx !== -1) {
						const existing = [...state.chats]
						const merged = { ...existing[idx], ...chat }

						merged.unread_count = active ? 0 : chat.unread_count || 0
						merged.last_message = chat.last_message

						const updated = [...state.chats]
						updated[idx] = merged

						return { chats: updated }
					}

					const newChat = {
						...chat,
						id: chatId,
						unread_count: chat.unread_count || 0,
					}

					newChat.unread_count = active ? 0 : chat.unread_count || 0
					newChat.last_message = chat.last_message

					return { chats: [newChat, ...state.chats] }
				})
			},

			// TODO: Review Code
			removeChat: (chatId) => {
				const chatIdStr = String(chatId)
				set((state) => ({
					chats: state.chats.filter((c) => String(c.id) !== chatIdStr),
					messages: Object.fromEntries(
						Object.entries(state.messages).filter(([id]) => id !== chatIdStr)
					),
				}))
			},

			fetchMessages: async (chatId, { force = false, maxAgeMs = 60_000 } = {}) => {
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
					const normalized = data.map((m: any) => ({
						...m,
						id: String(m.id),
						sender: String(m.sender),
					}))
					set((state) => ({
						messages: { ...state.messages, [chatId]: normalized },
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

			addMessage: (chatId, message) => {
				const chatIdStr = String(chatId)
				const currentUser = String(useAuthStore.getState().user?.id || "")
				const messageSender = String(message.sender)
				const isMine = messageSender === currentUser
				const activeChatId = get().activeChatId

				// TODO: debugging (remove later)
				console.log(`#addMessage DEBUG:`, {
					chatId: chatIdStr,
					messageId: message.id,
					messageSender,
					messageText: message.text,
					currentUser,
					isMine,
					activeChatId,
					isActiveChatId: activeChatId === chatIdStr,
				})

				set((state) => {
					const existing = state.messages[chatIdStr] || []
					const existingIndex = existing.findIndex((m) => m.id === String(message.id))

					let msgs
					if (existingIndex !== -1) {
						msgs = [...existing]
						msgs[existingIndex] = {
							...message,
							id: String(message.id),
							sender: String(message.sender),
						}
						console.log(`#addMessage Updated existing message at index ${existingIndex}`)
					} else {
						msgs = [
							...existing,
							{ ...message, id: String(message.id), sender: String(message.sender) },
						]
						console.log(`#addMessage Added new message, total count: ${msgs.length}`)
					}

					const chats = state.chats.map((c) => {
						if (String(c.id) !== chatIdStr) return c

						const inOpenChat = activeChatId === chatIdStr
						const nextUnread = isMine || inOpenChat ? 0 : (c.unread_count || 0) + 1

						console.log(`#addMessage Updating chat ${chatIdStr}:`, {
							isMine,
							inOpenChat,
							previousUnread: c.unread_count,
							nextUnread,
						})

						return {
							...c,
							last_message: message,
							unread_count: nextUnread,
						}
					})

					return { messages: { ...state.messages, [chatIdStr]: msgs }, chats }
				})
			},

			upsertMessage: (chatId, message) => {
				set((state) => {
					const chatIdStr = String(chatId)
					const msgs = state.messages[chatIdStr] || []
					const idx = msgs.findIndex((m) => m.id === String(message.id))
					if (idx !== -1) {
						const updated = [...msgs]
						updated[idx] = { ...updated[idx], ...message }
						return { messages: { ...state.messages, [chatIdStr]: updated } }
					}
					return {
						messages: { ...state.messages, [chatIdStr]: [...msgs, message] },
					}
				})
			},

			replaceMessages: (chatId, messages) => {
				set((state) => ({
					messages: { ...state.messages, [chatId]: messages },
				}))
			},

			markMessagesAsRead: (chatId, readerId) => {
				const chatIdStr = String(chatId)
				const readerIdStr = String(readerId)

				set((state) => {
					const msgs = (state.messages[chatIdStr] || []).map((m) =>
						!m.read_at && String(m.sender) !== readerIdStr
							? { ...m, read_at: new Date().toISOString() }
							: m
					)

					const chats = state.chats.map((c) =>
						String(c.id) === chatIdStr ? { ...c, unread_count: 0 } : c
					)

					return { messages: { ...state.messages, [chatIdStr]: msgs }, chats }
				})
			},

			setActiveChat: (chatId) => set({ activeChatId: chatId }),

			setTyping: (chatId, userId, typing) => {
				const state = get()

				// clear old timer
				const timerKey = `${chatId}-${userId}`
				if (state.typingTimers[timerKey]) {
					clearTimeout(state.typingTimers[timerKey])
				}

				set((prev) => ({
					typing: {
						...prev.typing,
						[chatId]: {
							...(prev.typing[chatId] || {}),
							[userId]: typing,
						},
					},
				}))

				if (typing) {
					const timeout = setTimeout(() => {
						set((prev) => ({
							typing: {
								...prev.typing,
								[chatId]: {
									...(prev.typing[chatId] || {}),
									[userId]: false,
								},
							},
						}))
					}, 5000)

					set((prev) => ({
						typingTimers: {
							...prev.typingTimers,
							[timerKey]: timeout,
						},
					}))
				}
			},

			setPresence: (userId, status, last_seen) => {
				set((state) => ({
					presence: {
						...state.presence,
						[userId]: { status, last_seen },
					},
				}))
			},

			reset: () => {
				// clear any pending timers
				const state = get()
				Object.values(state.typingTimers).forEach((timerId) => clearTimeout(timerId as number))

				set({
					chats: [],
					messages: {},
					loadingChats: false,
					loadingMessages: {},
					lastFetchedChatsAt: null,
					lastFetchedMessagesAt: {},
					typing: {},
					typingTimers: {},
					activeChatId: null,
					presence: {},
					error: null,
					hydrated: false,
				})
			},
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
				const isStale = !lastFetchedChatsAt || Date.now() - lastFetchedChatsAt > 60_000

				if (!chats || chats.length === 0 || isStale) {
					await state.fetchChats?.({ force: false })
				}

				set({ hydrated: true })
			},
		}
	)
)
