import { useEffect, useState } from "react"

export function useRelativeTime(dateString: string) {
	const [label, setLabel] = useState("")

	useEffect(() => {
		if (!dateString) return

		const update = () => {
			const now = new Date()
			const last = new Date(dateString)
			const diff = Math.floor((now.getTime() - last.getTime()) / 1000)

			if (diff < 60) setLabel("just now")
			else if (diff < 3600) setLabel(`${Math.floor(diff / 60)} min ago`)
			else if (diff < 86400) setLabel(`${Math.floor(diff / 3600)} hr ago`)
			else
				setLabel(
					last.toLocaleDateString() +
						" " +
						last.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
				)
		}

		update()
		const interval = setInterval(update, 60 * 1000) // refresh every minute
		return () => clearInterval(interval)
	}, [dateString])

	return label
}
