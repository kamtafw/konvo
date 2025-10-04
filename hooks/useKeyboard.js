import { useEffect, useState } from "react"
import { BackHandler, Keyboard, Platform } from "react-native"

export const useKeyboardHeight = () => {
	const [keyboardHeight, setKeyboardHeight] = useState(0)
	const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

	useEffect(() => {
		const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
		const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"

		const showSubscription = Keyboard.addListener(showEvent, (event) => {
			setKeyboardHeight(event.endCoordinates.height)
			setIsKeyboardVisible(true)
		})
		const hideSubscription = Keyboard.addListener(hideEvent, () => {
			setKeyboardHeight(0)
			setIsKeyboardVisible(false)
		})
		return () => {
			showSubscription.remove()
			hideSubscription.remove()
		}
	}, [])

	return { keyboardHeight, isKeyboardVisible }
}

export const useBackToDismissKeyboard = () => {
	const { isKeyboardVisible } = useKeyboardHeight()

	useEffect(() => {
		const onBackPress = () => {
			if (isKeyboardVisible) {
				Keyboard.dismiss()
				return true
			}
			return false
		}

		const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress)

		return () => subscription.remove()
	}, [isKeyboardVisible])
}
