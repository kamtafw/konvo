import { ENDPOINTS } from "@/api/endpoints"
import { create } from "zustand"
import { useAuthStore } from "./authStore"
import { useChatStore } from "./chatStore"

type ChatSocketState = {
	ws: WebSocket | null
	connect: (token: string) => void
	disconnect: () => void
	sendMessage: (chatId: string | null, text: string, otherUserId?: string) => void
	readChat: (chatId: string) => void
}

export const useChatSocketStore = create<ChatSocketState>((set, get) => ({
	ws: null,
	connect: (token) => {
		if (get().ws) return

		const WS_URL = `ws://${ENDPOINTS.IPV4}:8000/ws/chats/?token=${token}`
		const ws = new WebSocket(WS_URL)

		ws.onopen = () => {
			console.log("✅ Chat WebSocket connected")

			const chatIds = useChatStore.getState().chats.map((c) => String(c.id))
			ws.send(JSON.stringify({ type: "subscribe", payload: { chats: chatIds } }))
		}

		ws.onmessage = (event) => {
			const chatStore = useChatStore.getState()

			try {
				const data = JSON.parse(event.data)
				const { payload } = data

				switch (data.type) {
					case "new_message": {
						const { chat_id, id, sender, text, created_at } = payload
						const chatIdStr = String(chat_id)

						const ws = get().ws
						if (ws && !chatStore.chats.some((c) => String(c.id) === chatIdStr)) {
							ws.send(JSON.stringify({ type: "subscribe", payload: { chats: [chatIdStr] } }))
						}

						chatStore.addMessage(chatIdStr, {
							id: String(id),
							sender: String(sender),
							text,
							created_at,
						})

						if (chatIdStr === chatStore.activeChatId) {
							get().readChat(chatIdStr)
						}
						break
					}

					case "typing": {
						const { chat_id, sender, is_typing } = payload
						chatStore.setTyping(String(chat_id), String(sender), !!is_typing)
						break
					}

					// TODO: handle this properly; chat reads on open, but remains unread on refresh
					case "read": {
						const { chat_id, user } = payload
						chatStore.markMessagesAsRead(String(chat_id), String(user))
						break
					}

					case "chat_update": {
						const updatedChat = {
							...payload,
							id: String((payload as any).id),
						}
						chatStore.upsertChat(updatedChat)
						break
					}

					case "new_chat":
						const { chat_id, placeholder_id } = payload
						if (placeholder_id && chat_id) {
							const realChat = {
								id: String(chat_id),
								participants: payload.participants || [],
								last_message: payload.last_message || null,
								unread_count: payload.unread_count || 0,
								created_at: payload.created_at || new Date().toISOString(),
							}
							chatStore.startChatLocal(String(placeholder_id), realChat)
						}

						const ws = get().ws
						if (ws) {
							ws.send(JSON.stringify({ type: "subscribe", payload: { chats: [String(chat_id)] } }))
						}
						break

					default: {
						console.warn("Unknown Chat event:", data)
					}
				}
			} catch (err) {
				console.error("WS parse error:", err)
			}
		}

		ws.onclose = () => {
			console.log("❌ Chat WebSocket closed, retrying in 3s")
			set({ ws: null })
			setTimeout(() => get().connect(token), 3000)
		}

		set({ ws })
	},

	disconnect: () => {
		get().ws?.close()
		set({ ws: null })
	},

	sendMessage: (chatId, text, otherUserId) => {
		const ws = get().ws
		if (ws?.readyState === WebSocket.OPEN) {
			const isNewChat = !chatId || chatId === "new"
			const type = `chat:${isNewChat ? "new" : "existing"}`

			let actualChatId = chatId
			let placeholderId: string | undefined

			if (isNewChat) {
				placeholderId = `placeholder_${Date.now()}_${otherUserId}`
				actualChatId = null

				// create temporary chat in the store for immediate UI feedback
				const chatStore = useChatStore.getState()
				const currentUser = useAuthStore.getState().user

				if (currentUser && otherUserId) {
					const placeholderMessage = {
						id: `temp_${Date.now()}`,
						sender: String(currentUser.id),
						text,
						created_at: new Date().toISOString(),
						read_at: undefined,
					}
					chatStore.addMessage(placeholderId, placeholderMessage)
				}
			}

			const payload: any = {
				message: text,
			}

			if (actualChatId) {
				payload.chat_id = String(actualChatId)
			}

			if (otherUserId) {
				payload.other_user_id = String(otherUserId)
			}

			ws.send(JSON.stringify({ type, payload }))
		}
	},

	readChat: (chatId) => {
		const readerId = useAuthStore.getState().user?.id
		if (readerId) useChatStore.getState().markMessagesAsRead(String(chatId), String(readerId))

		const ws = get().ws
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({ type: "read", payload: { chat_id: String(chatId) } }))
		}
	},
}))
