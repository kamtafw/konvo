import * as authService from "@/services/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type ProfileState = {
	profile: Profile | null
	error: string | null
	loading: boolean
	lastFetchedAt: number | null
	hydrated: boolean

	fetchProfile: (opts?: { force?: boolean; maxAgeMs?: number }) => Promise<void>
	updateProfile: (patch: Partial<Profile>) => Promise<void>
	updateAvatar: (uri: string) => Promise<void> // returns new avatar url
	setProfile: (patch: Partial<Profile>) => void
	reset: () => void
}

export const useProfileStore = create(
	persist<ProfileState>(
		(set, get) => ({
			profile: null,
			loading: false,
			error: null,
			lastFetchedAt: null,
			hydrated: false,

			fetchProfile: async ({ force = false, maxAgeMs = 2 * 60_000 } = {}) => {
				const { lastFetchedAt, profile } = get()
				const isStale = !lastFetchedAt || Date.now() - lastFetchedAt > maxAgeMs

				if (!force && profile && !isStale) return

				set({ loading: true, error: null })
				try {
					const data = await authService.getUserProfile()
					set({ profile: data, lastFetchedAt: Date.now() })
				} catch (e: any) {
					set({ error: e?.message || "Failed to load profile" })
				} finally {
					set({ loading: false })
				}
			},

			updateProfile: async (patch) => {
				const prevProfile = get().profile

				set((state) => ({
					profile: state.profile ? { ...state.profile, ...patch } : (patch as Profile),
				}))

				try {
					const data = await authService.updateUserProfile(patch)
					set({ profile: data, lastFetchedAt: Date.now() })
				} catch (e: any) {
					set({ profile: prevProfile, error: e?.message || "Failed to update profile" })
				}
			},

			setProfile: (patch) =>
				set((state) => ({
					profile: state.profile ? { ...state.profile, ...patch } : (patch as Profile),
				})),

			updateAvatar: async (uri) => {
				const prevProfile = get().profile

				set((state) => ({
					profile: state.profile ? { ...state.profile, avatar_url: uri } : (uri as any),
				}))

				const form = new FormData()
				const name = uri.split("/").pop()
				form.append("avatar", { uri, name, type: "image/jpeg" })

				try {
					const { url } = await authService.updateUserAvatar(form)
					set((state) => ({
						profile: state.profile ? { ...state.profile, avatar_url: url } : (url as any),
					}))
				} catch (e: any) {
					set({ profile: prevProfile })
					throw new Error(e?.message || "Failed to update avatar")
				}
			},

			reset: () =>
				set({ profile: null, loading: false, error: null, lastFetchedAt: null, hydrated: false }),
		}),
		{
			name: "profile-storage",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				profile: state.profile,
				loading: state.loading,
				error: state.error,
				lastFetchedAt: state.lastFetchedAt,
			}),
			onRehydrateStorage: () => async (state) => {
				if (!state) return

				const { lastFetchedAt, profile } = state
				const isStale = !lastFetchedAt || Date.now() - lastFetchedAt > 2 * 60_000

				if (!profile || isStale) {
					await state.fetchProfile?.({ force: false })
				}

				set({ hydrated: true })
			},
		}
	)
)
