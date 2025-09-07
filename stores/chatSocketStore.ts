import { ENDPOINTS } from "@/api/endpoints"
import { create } from "zustand"
import { useAuthStore } from "./authStore"
import { useChatStore } from "./chatStore"

type ChatSocketState = {
	ws: WebSocket | null
	connect: (token: string) => void
	disconnect: () => void
	sendMessage: (chatId: string, text: string) => void
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
					case "message": {
						const { chat_id, id, sender, text, created_at } = payload
						chatStore.addMessage(String(chat_id), {
							id: String(id),
							sender: String(sender),
							text,
							created_at,
						})

						if (String(chat_id) === chatStore.activeChatId) {
							get().readChat(String(chat_id))
						}
						break
					}
					case "typing": {
						const { chat_id, sender, is_typing } = payload
						chatStore.setTyping(String(chat_id), String(sender), !!is_typing)
						break
					}
					case "read": {
						const { chat_id, user } = payload
						chatStore.markMessagesAsRead(String(chat_id), String(user))
						break
					}
					case "chat_update": {
						const incoming = {
							...payload,
							id: String((payload as any).id),
						}
						chatStore.upsertChat(incoming)
						break
					}
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

	sendMessage: (chatId, text) => {
		const ws = get().ws
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(
				JSON.stringify({ type: "message", payload: { chat_id: String(chatId), message: text } })
			)
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
