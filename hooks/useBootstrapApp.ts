// import * as Notifications from "expo-notifications"
import { useEffect, useState } from "react"
import { useAuthStore } from "../stores/authStore"
import { useSettingsStore } from "../stores/settingsStore"

export const useBootstrapApp = () => {
	const [ready, setReady] = useState(false)
	const user = useAuthStore((state) => state.user)
	const refreshToken = useAuthStore((state) => state.refreshToken)
	const pushEnabled = useSettingsStore((state) => state.pushEnabled)
	const setPushEnabled = useSettingsStore((state) => state.setPushEnabled)

	useEffect(() => {
		const init = async () => {
			// restore persisted settings first
			await useSettingsStore.persist.rehydrate()

			// auto-login if refresh token exists
			await refreshToken()

			// sync push reference
			// if (pushEnabled) {
			// 	const { status } = await Notifications.getPermissionsAsync()
			// 	if (status !== "granted") {
			// 		const request = await Notifications.requestPermissionsAsync()
			// 		setPushEnabled(request.status === "granted")
			// 	}
			// }

			setReady(true)
		}
		init()
	}, [])

	return { ready, user }
}
