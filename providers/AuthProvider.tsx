import { api, ENDPOINTS } from "@/api"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { SplashScreen, useRouter } from "expo-router"
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react"

SplashScreen.preventAutoHideAsync()

type AuthContextType = {
	isReady: boolean
	isLoggedIn: boolean
	login: () => void
	logout: () => void
	signup: () => void
}

const authStorageKey = "auth-key"

export const AuthContext = createContext<AuthContextType>({
	isReady: false,
	isLoggedIn: false,
	login: () => {},
	logout: () => {},
	signup: () => {},
})

export const AuthProvider = ({ children }: PropsWithChildren) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [isReady, setIsReady] = useState(false)
	const router = useRouter()

	const storeAuthState = async (newState: { isLoggedIn: boolean }) => {
		try {
			const value = JSON.stringify(newState)
			await AsyncStorage.setItem(authStorageKey, value)
		} catch (error) {
			console.error("Failed to store auth state:", error)
		}
	}

	const login = async ({ phone, password }: any) => {
		const response = await api.post(ENDPOINTS.LOGIN, { phone, password })
		
		setIsLoggedIn(true)
		storeAuthState({ isLoggedIn: true })
		router.replace("/")
	}

	const logout = () => {
		setIsLoggedIn(false)
		storeAuthState({ isLoggedIn: false })
		router.replace("/login")
	}

	const signup = () => {
		// Handle signup logic here
	}

	useEffect(() => {
		const getAuthState = async () => {
			await new Promise((resolve) => setTimeout(resolve, 2000)) // simulate loading delay
			try {
				const value = await AsyncStorage.getItem(authStorageKey)
				if (value) {
					const { isLoggedIn } = JSON.parse(value)
					setIsLoggedIn(isLoggedIn)
				}
			} catch (error) {
				console.error("Failed to retrieve auth state:", error)
			}

			setIsReady(true)
		}
		getAuthState()
	}, [])

	useEffect(() => {
		if (isReady) {
			SplashScreen.hideAsync()
		}
	}, [isReady])

	return (
		<AuthContext.Provider value={{ isReady, isLoggedIn, login, logout, signup }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}
