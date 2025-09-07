import { ENDPOINTS } from "@/api"
import { create } from "zustand"
import { useChatStore } from "./chatStore"

type PresenceSocketState = {
	ws: WebSocket | null
	connect: (token: string) => void
	disconnect: () => void
}

export const usePresenceSocketStore = create<PresenceSocketState>((set, get) => ({
	ws: null,
	connect: (token) => {
		if (get().ws) return

		const WS_URL = `ws://${ENDPOINTS.IPV4}:8000/ws/presence/?token=${token}`
		const ws = new WebSocket(WS_URL)

		ws.onopen = () => console.log("✅ Presence WebSocket connected")

		ws.onmessage = (event) => {
			const chatStore = useChatStore.getState()

			try {
				const data = JSON.parse(event.data)

				const { payload } = data

				switch (data.type) {
					case "presence": {
						const { user, status, last_seen } = payload
						chatStore.setPresence(user, status, last_seen)
						break
					}
					default: {
						console.warn("Unknown Presence event:", data)
					}
				}
			} catch (err) {
				console.error("WS parse error:", err)
			}
		}

		ws.onclose = () => {
			console.log("❌ Presence WebSocket closed, retrying in 3s")
			set({ ws: null })
			setTimeout(() => get().connect(token), 3000)
		}

		set({ ws })
	},

	disconnect: () => {
		get().ws?.close()
		set({ ws: null })
	},
}))
