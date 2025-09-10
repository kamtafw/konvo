import { ENDPOINTS } from "@/api"
import { create } from "zustand"
import { useFriendStore } from "./friendStore"

type FriendSocketState = {
	ws: WebSocket | null
	connect: (token: string) => void
	disconnect: () => void
	// sendFriendRequest: (message: string) => void;
	// respondFriendRequest: (callback: (message: string) => void) => void;
	respondFriendRequest: (requestId: string, action: "accept" | "reject") => void
}

export const useFriendSocketStore = create<FriendSocketState>((set, get) => ({
	ws: null,
	connect: (token) => {
		if (get().ws) return

		const WS_URL = `ws://${ENDPOINTS.IPV4}:8000/ws/friends/?token=${token}`
		const ws = new WebSocket(WS_URL)

		ws.onopen = () => console.log("✅ Friend WebSocket connected")

		ws.onmessage = (event) => {
			const friendStore = useFriendStore.getState()

			try {
				const data = JSON.parse(event.data)
				const { payload } = data

				switch (data.type) {
					case "friend_request:send":
						console.log("SENDING FRIEND REQUEST")
						// friendStore.addFriendRequest(payload)
						break

					case "friend_request:receive":
						friendStore.addFriendRequest(payload)
						break

					case "friend_request:accept":
						const { request_id, ...friend } = payload
						if (request_id) friendStore.removeFriendRequest(request_id)
						friendStore.addFriend(friend)
						break

					case "friend_request:reject":
						friendStore.removeFriendRequest(payload.request_id)
						break

					default:
						console.warn("Unknown Friend event:", data)
				}
			} catch (err) {
				console.error("WS parse error:", err)
			}
		}

		ws.onclose = () => {
			console.log("❌ Friend WebSocket closed, retrying in 3s")
			set({ ws: null })
			setTimeout(() => get().connect(token), 3000)
		}

		set({ ws })
	},

	disconnect: () => {
		get().ws?.close()
		set({ ws: null })
	},

	respondFriendRequest: (requestId, action) => {
		const ws = get().ws
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(
				JSON.stringify({ type: `friend_request:${action}`, payload: { request_id: requestId } })
			)
		}
	},
}))
