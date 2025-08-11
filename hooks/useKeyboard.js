import {useEffect, useState} from "react"
import {BackHandler, Keyboard} from "react-native"

export const useKeyboardVisible = () => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", () =>
            setVisible(true),
        )
        const hideSub = Keyboard.addListener("keyboardDidHide", () =>
            setVisible(false),
        )
        return () => {
            showSub.remove()
            hideSub.remove()
        }
    }, [])

    return visible
}

export const useBackToDismissKeyboard = () => {
    const keyboardVisible = useKeyboardVisible()

    useEffect(() => {
        const onBackPress = () => {
            if (keyboardVisible) {
                Keyboard.dismiss()
                return true
            }
            return false
        }

        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            onBackPress,
        )

        return () => subscription.remove()
    }, [keyboardVisible])
}
