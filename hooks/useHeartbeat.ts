import { useEffect, useRef } from "react"

export function useHeartbeat(socket: WebSocket | null, interval = 30000) {
	const timer = useRef<ReturnType<typeof setInterval> | null>(null)

	useEffect(() => {
		if (!socket) return

		const sendHeartbeat = () => {
			if (socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({ event: "heartbeat" }))
			}
		}

		timer.current = setInterval(sendHeartbeat, interval)
		return () => {
			if (timer.current) clearInterval(timer.current)
		}
	}, [socket, interval])
}
