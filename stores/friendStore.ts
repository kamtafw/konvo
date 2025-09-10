import * as friendService from "@/services/friend"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type FriendState = {
	friendList: Friend[]
	friendRequests: FriendRequest[]
	friendSuggestions: Profile[]
	loadingFriendList: boolean
	loadingFriendRequests: boolean
	loadingFriendSuggestions: boolean
	lastFetchedFriendListAt: number | null
	lastFetchedFriendRequestsAt: number | null
	lastFetchedFriendSuggestionsAt: number | null
	error: string | null
	hydrated: boolean

	fetchFriendList: (opts?: { force?: boolean; maxAgeMs?: number }) => Promise<void>
	fetchFriendRequests: (opts?: { force?: boolean; maxAgeMs?: number }) => Promise<void>
	fetchFriendSuggestions: (opts?: { force?: boolean; maxAgeMs?: number }) => Promise<void>
	sendFriendRequest: (userId: string) => Promise<void>
	respondFriendRequest: (requestId: string, action: "accept" | "reject") => Promise<void>

	addFriend: (friend: any) => void
	// removeFriend: () => void
	// upsertFriend: () => void
	addFriendRequest: (friendRequest: any) => void
	removeFriendRequest: (requestId: string) => void
	// upsertFriendRequest: (friendRequest: any) => void

	reset: () => void
}

export const useFriendStore = create(
	persist<FriendState>(
		(set, get) => ({
			friendList: [],
			friendRequests: [],
			friendSuggestions: [],
			loadingFriendList: false,
			loadingFriendRequests: false,
			loadingFriendSuggestions: false,
			lastFetchedFriendListAt: null,
			lastFetchedFriendRequestsAt: null,
			lastFetchedFriendSuggestionsAt: null,
			error: null,
			hydrated: false,

			fetchFriendList: async ({ force = false, maxAgeMs = 120_000 } = {}) => {
				const { lastFetchedFriendListAt, friendList } = get()
				const isStale = !lastFetchedFriendListAt || Date.now() - lastFetchedFriendListAt > maxAgeMs
				if (!force && friendList.length > 0 && !isStale) return

				set({ loadingFriendList: true, error: null })
				try {
					const data = await friendService.getFriendList()
					const normalized = data.map((f: any) => ({
						...f,
						id: String(f.id),
						createdAt: f.created_at,
					}))
					set({ friendList: normalized, lastFetchedFriendListAt: Date.now() })
				} catch (e: any) {
					set({ error: e?.message || "Failed to load friend-list" })
				} finally {
					set({ loadingFriendList: false })
				}
			},

			fetchFriendRequests: async ({ force = false, maxAgeMs = 60_000 } = {}) => {
				const { lastFetchedFriendRequestsAt, friendRequests } = get()
				const isStale =
					!lastFetchedFriendRequestsAt || Date.now() - lastFetchedFriendRequestsAt > maxAgeMs
				if (!force && friendRequests.length > 0 && !isStale) return

				set({ loadingFriendRequests: true, error: null })
				try {
					const data = await friendService.getFriendRequests()
					const normalized = data.map((f: any) => ({
						id: String(f.id),
						createdAt: f.created_at,
						from: f.from_user,
					}))
					set({ friendRequests: normalized, lastFetchedFriendRequestsAt: Date.now() })
				} catch (e: any) {
					set({ error: e?.message || "Failed to load friend-requests" })
				} finally {
					set({ loadingFriendRequests: false })
				}
			},

			fetchFriendSuggestions: async ({ force = false, maxAgeMs = 120_000 } = {}) => {
				const { lastFetchedFriendSuggestionsAt, friendSuggestions } = get()
				const isStale =
					!lastFetchedFriendSuggestionsAt || Date.now() - lastFetchedFriendSuggestionsAt > maxAgeMs
				if (!force && friendSuggestions.length > 0 && !isStale) return

				set({ loadingFriendSuggestions: true, error: null })
				try {
					const data = await friendService.getFriendSuggestions()
					const normalized = data.map((f: any) => ({
						...f,
						id: String(f.id),
						avatarUrl: f.avatar_url,
						createdAt: f.created_at,
					}))
					set({ friendSuggestions: normalized, lastFetchedFriendSuggestionsAt: Date.now() })
				} catch (e: any) {
					set({ error: e?.message || "Failed to load friend-suggestions" })
				} finally {
					set({ loadingFriendSuggestions: false })
				}
			},

			sendFriendRequest: async (userId) => {
				set({ error: null })
				try {
					await friendService.sendFriendRequest(userId)
				} catch (e: any) {
					set({ error: e?.message || "Failed to send friend request" })
				}
			},

			respondFriendRequest: async (requestId, action) => {
				const { friendRequests } = get()
				const exists = friendRequests.find((req) => req.id === String(requestId))
				if (!exists) return

				set({ loadingFriendRequests: true, error: null })
				try {
					await friendService.respondFriendRequest(requestId, action)
					await get().fetchFriendRequests()
				} catch (e: any) {
					set({ error: e?.message || "Failed to respond to friend request" })
				} finally {
					set({ loadingFriendRequests: false })
				}
			},

			addFriend: (friend) => {
				set((state) => {
					const existing = state.friendList
					const friends = [
						...existing,
						{
							...friend,
							id: String(friend.id),
							createdAt: friend.created_at,
						},
					]

					return { friendList: friends }
				})
			},

			addFriendRequest: (friendRequest) => {
				set((state) => {
					const existing = state.friendRequests
					const requests = [
						...existing,
						{
							id: String(friendRequest.id),
							createdAt: friendRequest.created_at,
							from: friendRequest.from_user,
						},
					]

					return { friendRequests: requests }
				})
			},

			removeFriendRequest: (requestId) => {
				set((state) => ({
					friendRequests: state.friendRequests.filter((req) => req.id !== String(requestId)),
				}))
			},

			reset: () => {
				set({
					friendList: [],
					friendRequests: [],
					friendSuggestions: [],
					loadingFriendList: false,
					loadingFriendRequests: false,
					loadingFriendSuggestions: false,
					error: null,
					hydrated: false,
				})
			},
		}),
		{
			name: "friends-storage",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				friendList: state.friendList,
				friendRequests: state.friendRequests,
				friendSuggestions: state.friendSuggestions,
				lastFetchedFriendListAt: state.lastFetchedFriendListAt,
				lastFetchedFriendRequestsAt: state.lastFetchedFriendRequestsAt,
				lastFetchedFriendSuggestionsAt: state.lastFetchedFriendSuggestionsAt,
			}),
			onRehydrateStorage: () => async (state) => {
				if (!state) return

				const { lastFetchedFriendListAt, friendList } = state
				const isStale = !lastFetchedFriendListAt || Date.now() - lastFetchedFriendListAt > 120_000

				if (!friendList || friendList.length === 0 || isStale) {
					await state.fetchFriendList?.({ force: false })
				}

				set({ hydrated: true })
			},
		}
	)
)
