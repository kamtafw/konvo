import { ScrollView, Text, View } from "react-native"

const Friends = () => {
	return (
		<ScrollView className="flex-1 px-4 py-6 bg-background">
			<View className="flex-1 justify-center items-center">
				<Text className="text-3xl text-onSurface">FRIENDS</Text>
			</View>
		</ScrollView>
	)
}

export default Friends
