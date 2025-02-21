/************************/
/*  Name: Tomáš Skýpala  */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router';

// Interface for the component props
interface PotencionalFriendTabProps {
    id: string;
    picture: string;
    name: string;
    onAccept: () => void;
    onDecline: () => void;
}

// Component to display a potential friend tab
const PotencionalFriendTab: React.FC<PotencionalFriendTabProps> = ({ id, picture, name, onAccept, onDecline }) => {
  return (
    <View className="w-full flex-row items-center justify-between rounded-xl mb-3 bg-fields p-2">
      {/* Touchable area to navigate to the user's profile */}
      <TouchableOpacity onPress={() => router.push(`/profile/${id}`)}>
        <View className="flex-row items-center">
          {/* Display user's profile picture */}
          <Image source={{ uri: picture }} className="w-12 h-12 rounded-full" />
          {/* Display user's name */}
          <Text className="text-2xl">{name}</Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row space-x-2">
        {/* Button to accept the friend request */}
        <TouchableOpacity onPress={onAccept}>
          <View className="px-4 py-2 rounded-xl bg-green-500">
            <Ionicons name="checkmark" size={24} color="black" />
          </View>
        </TouchableOpacity>
        {/* Button to decline the friend request */}
        <TouchableOpacity onPress={onDecline}>
          <View className="px-4 py-2 rounded-xl bg-red-500">
            <Ionicons name="close" size={24} color="black" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PotencionalFriendTab;
