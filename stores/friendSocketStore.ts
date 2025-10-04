import { ENDPOINTS } from "@/api"
import { create } from "zustand"
import { useAuthStore } from "./authStore"
import { useFriendStore } from "./friendStore"

type FriendSocketState = {
	ws: WebSocket | null
	connect: (token: string) => void
	disconnect: () => void

	actOnFriendSuggestion: (suggestionId: string, action: "add" | "remove") => void
	respondFriendRequest: (requestId: string, action: "accept" | "reject") => void
}

export const useFriendSocketStore = create<FriendSocketState>((set, get) => ({
	ws: null,
	connect: (token) => {
		const currentUser = useAuthStore.getState().user

		if (get().ws) {
			get().ws?.close()
			set({ ws: null })
		}

		const WS_URL = `ws://${ENDPOINTS.IPV4}:8000/ws/friends/?token=${token}`
		const ws = new WebSocket(WS_URL)

		ws.onopen = () => {
			console.log(`✅ Friend WebSocket connected for user: ${currentUser?.id}`)
		}

		ws.onmessage = (event) => {
			const friendStore = useFriendStore.getState()
			const authUser = useAuthStore.getState().user

			try {
				const data = JSON.parse(event.data)
				const { payload } = data

				if (!authUser) return

				switch (data.type) {
					case "friend_request:send":
						const { to_user_id: suggestionId } = payload
						friendStore.removeFriendSuggestion(suggestionId)
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

		ws.onclose = (event) => {
			console.log(
				`❌ Friend WebSocket closed for user ${currentUser?.id}, code: ${event.code}, reason: ${event.reason}`
			)
			set({ ws: null })

			// reconnect if we still have a valid user
			const stillLoggedIn = useAuthStore.getState().user
			if (stillLoggedIn) {
				console.log(`#WebSocket Reconnecting in 3s for user ${stillLoggedIn.id}`)
				setTimeout(() => {
					const currentToken = useAuthStore.getState().access
					if (currentToken && stillLoggedIn) {
						get().connect(currentToken)
					}
				}, 3000)
			} else {
				console.log(`#WebSocket Not reconnecting - user logged out`)
			}
		}

		ws.onerror = (error) => {
			console.error(`#WebSocket Error for user ${currentUser?.id}:`, error)
		}

		set({ ws })
	},

	disconnect: () => {
		const currentUser = useAuthStore.getState().user
		console.log(`#WebSocket Disconnecting for user: ${currentUser?.id}`)

		const ws = get().ws
		if (ws) {
			ws.close(1000, "User logout")
		}
		set({ ws: null })
	},

	actOnFriendSuggestion: (suggestionId, action) => {
		if (action === "remove") {
			useFriendStore.getState().removeFriendSuggestion(suggestionId)
		}

		if (action === "add") {
			const ws = get().ws
			if (ws?.readyState === WebSocket.OPEN) {
				ws.send(
					JSON.stringify({ type: "friend_request:send", payload: { to_user_id: suggestionId } })
				)
			}
		}
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
