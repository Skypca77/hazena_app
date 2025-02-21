import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { AntDesign } from '@expo/vector-icons'

const DrinkTab = ( { title, amount, plusCount, minusCount } ) => {
  return (
    <View className="h-1/8 w-full rounded-xl mb-4 justify-center items-center bg-fields">
      <Text className="text-4xl">{title}</Text>
      <View>
        <View className="flex-row items-center justify-between w-full px-10 mt-4">
          

          <TouchableOpacity className="mb-4" onPress={plusCount}>
            <AntDesign name="pluscircleo" size={30} color="black"/>
          </TouchableOpacity>
          
          <View className="flex-1 items-center">
            <Text className="text-5xl">{ amount }</Text>
          </View>
          
          <TouchableOpacity className="mb-4" onPress={minusCount}>
            <AntDesign name="minuscircleo" size={30} color="black"/>
          </TouchableOpacity>
        </View>
      </View>
      
    </View>
  )
}

export default DrinkTab