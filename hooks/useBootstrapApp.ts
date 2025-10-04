import { useChatSocketStore } from "@/stores/chatSocketStore"
import { useChatStore } from "@/stores/chatStore"
import { useFriendSocketStore } from "@/stores/friendSocketStore"
import { useFriendStore } from "@/stores/friendStore"
import { usePresenceSocketStore } from "@/stores/presenceSocketStore"
import { useEffect, useState } from "react"
import { useAuthStore } from "../stores/authStore"
import { useProfileStore } from "../stores/profileStore"
import { useSettingsStore } from "../stores/settingsStore"

export const useBootstrapApp = () => {
	const [ready, setReady] = useState(false)
	const user = useAuthStore((state) => state.user)
	const token = useAuthStore((state) => state.access)

	useEffect(() => {
		const init = async () => {
			await Promise.all([
				useAuthStore.persist.rehydrate(),
				useChatStore.persist.rehydrate(),
				useFriendStore.persist.rehydrate(),
				useProfileStore.persist.rehydrate(),
				useSettingsStore.persist.rehydrate(),
			])

			await useAuthStore.getState().refreshToken()
			await useProfileStore.getState().fetchProfile({ force: true })
			await useChatStore.getState().fetchChats({ force: false })

			if (token) {
				useChatSocketStore.getState().connect(token)
				useFriendSocketStore.getState().connect(token)
				usePresenceSocketStore.getState().connect(token)
			}

			setReady(true)
		}
		init()
	}, [])

	return { ready, user }
}
