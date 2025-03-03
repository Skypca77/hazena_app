import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

interface FriendTabProps {
  id: string;
  title: string;
  btnText: string;
  onPress: () => void;
}

const FriendTab: React.FC<FriendTabProps> = ({ id, title, btnText, onPress }) => {
  return (
    <View className="w-full flex-row items-center justify-between rounded-xl mb-3 bg-fields p-2">
      <TouchableOpacity onPress={() => router.push(`/profile/${id}`)}>
        <Text className="text-2xl">{title}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPress}>
        <View className='px-5 py-2 rounded-xl bg-buttonBlue'>
          <Text className="text-white">{btnText}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default FriendTab