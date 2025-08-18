// import * as Notifications from "expo-notifications"
import { useChatStore } from "@/stores/chatStore"
import { useEffect, useState } from "react"
import { useAuthStore } from "../stores/authStore"
import { useProfileStore } from "../stores/profileStore"
import { useSettingsStore } from "../stores/settingsStore"

export const useBootstrapApp = () => {
	const [ready, setReady] = useState(false)
	const user = useAuthStore((state) => state.user)
	const fetchChats = useChatStore((state) => state.fetchChats)
	const refreshToken = useAuthStore((state) => state.refreshToken)
	const pushEnabled = useSettingsStore((state) => state.pushEnabled)
	const fetchProfile = useProfileStore((state) => state.fetchProfile)
	const setPushEnabled = useSettingsStore((state) => state.setPushEnabled)

	useEffect(() => {
		const init = async () => {
			// rehydrate stores
			await Promise.all([
				useAuthStore.persist.rehydrate(),
				useChatStore.persist.rehydrate(),
				useProfileStore.persist.rehydrate(),
				useSettingsStore.persist.rehydrate(),
			])

			// auto-login if refresh token exists
			await refreshToken()

			await fetchProfile({ force: true })
			await fetchChats({ force: true })

			// background fetch all data
			// Promise.allSettled([fetchProfile()])

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
