import { ENDPOINTS } from "@/api"
import { create } from "zustand"
import { useAuthStore } from "./authStore"
import { useChatStore } from "./chatStore"

type PresenceSocketState = {
	ws: WebSocket | null
	connect: (token: string) => void
	disconnect: () => void
}

export const usePresenceSocketStore = create<PresenceSocketState>((set, get) => ({
	ws: null,
	connect: (token) => {
		const currentUser = useAuthStore.getState().user

		if (get().ws) {
			get().ws?.close()
			set({ ws: null })
		}

		const WS_URL = `ws://${ENDPOINTS.IPV4}:8000/ws/presence/?token=${token}`
		const ws = new WebSocket(WS_URL)

		ws.onopen = () => {
			console.log(`✅ Presence WebSocket connected for user: ${currentUser?.id}`)
		}

		ws.onmessage = (event) => {
			const chatStore = useChatStore.getState()
			const authUser = useAuthStore.getState().user

			try {
				const data = JSON.parse(event.data)
				const { payload } = data

				if (!authUser) return

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

		ws.onclose = (event) => {
			console.log(
				`❌ Presence WebSocket closed for user ${currentUser?.id}, code: ${event.code}, reason: ${event.reason}`
			)
			set({ ws: null })

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
}))
