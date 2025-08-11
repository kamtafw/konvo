import {Platform, Pressable} from "react-native";
import {router} from "expo-router";
import clsx from "clsx";
import {cssInterop} from "nativewind";
import {Feather} from "@expo/vector-icons";
import {useTheme} from "@/providers/ThemeProvider";

cssInterop(Feather, {
    className: {
        target: "style",
        nativeStyleToProp: {height: true, width: true, size: true},
    },
});

const FloatingAB = () => {
    const {theme} = useTheme();

    return (
        <Pressable
            onPress={() => router.push("/profile")}
            className={clsx(
                "absolute right-8 z-50 bg-primary rounded-full p-4 shadow-lg",
                Platform.OS === "android" ? "bottom-14" : "bottom-18",
            )}
            style={{elevation: 6}}
        >

            <Feather
                name="plus"
                className={clsx(theme === 'light' && "text-white")}
                size={24}
            />
        </Pressable>
    );
};

export default FloatingAB;
