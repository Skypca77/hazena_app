import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomButton from '@/components/CustomButton';
import { router, useFocusEffect } from 'expo-router';
import { getActiveSession, getFriends, getSessionAttendants, sign_out } from '@aw/index';
import TopBar from '@/components/TopBar';
import SearchInput from '@/components/SearchInput';


const Friends = () => {
  
  const [isSubmit, setIsSubmit] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isGoToCreateFriend, setIsGoToCreateFriend] = useState(false)
  const [friendData, setFriendData] = useState<any[] | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );


  //fetch function with query
  const fetchData = async (query = '') => {
    setIsLoading(true);
    
    try {
      //these to may be useless
      const session = await getActiveSession();
      const attendants = await getSessionAttendants();

      //gets friends
      const friends = await getFriends(query);

      setFriendData(friends);
    } catch (error) {
      alert(error);
    }
    finally{
      setIsLoading(false);
    }
  }

  //redirect after add friend after button is pressed
  const goToCreateFriend = async () => {
    setIsGoToCreateFriend(true);

    try {
        router.push('/friends/createFriend');
    } catch (e) {
        alert(e);
    }
    finally {
      setIsGoToCreateFriend(false);
    }
  }

  //search functions
  const Search = () => {
    fetchData(searchText);
  };

  return (
    <SafeAreaView className="bg-mainBackground h-full">
      <TopBar/>

      <View className="h-full px-4 flex-1">
        <View className="mt-3 flex-row items-center">
          <View className="flex-1 mr-2">
              <SearchInput searchText={searchText} setSearchText={setSearchText} title="Find your friend..."  onSearch={Search}/>
          </View>
          <TouchableOpacity onPress={goToCreateFriend}>
              <View className='h-12 pl-3 px-4 mb-4 justify-center items-center rounded-lg bg-buttonBlue'>
                  <Text className='text-2xl mt-1 ml-1'>Add friend</Text>
              </View>
          </TouchableOpacity>
        </View>

        {isLoading && (<ActivityIndicator size="large" color="#ffffff"/>)}

        <ScrollView className="mt-2 h-full">
        {friendData && friendData.length > 0 ? (
          friendData.map((friend) => (
          <View key={friend.$id} className="w-full flex-row items-center justify-between rounded-xl mb-3 bg-fields p-2">
            <TouchableOpacity onPress={() => router.push(`/profile/${friend.$id}`)}>
              <Text className="text-2xl">{friend.username}</Text>
            </TouchableOpacity>
          </View>
          ))
          ) : (
            <View className="flex items-center justify-center mt-4">
              <Text className="text-gray-500">You dont have any friends yet.</Text>
              <Text className="text-gray-500">Add friends at the top right corner!</Text>
            </View>
          )}
        </ScrollView>
      </View>

    </SafeAreaView>
  )
}

export default Friends