import { Link, Redirect, router} from 'expo-router';
import { StatusBar } from "expo-status-bar";
import { Text, View } from 'react-native';

import { useGlobalContext } from '../context/GlobalProvider';

export default function App() {
    const {isLoading, isLoggedIn } = useGlobalContext();

    if(!isLoading && isLoggedIn) return <Redirect href="/(tabs)/friends"/>

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-3xl">ITU project</Text>
            <StatusBar style="auto" />
            <Link href="/sign_in" className="text-blue-500">Go to sign in</Link>
        </View>
    )
}
