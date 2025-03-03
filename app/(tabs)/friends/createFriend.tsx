/****************************/
/*  Name: Miroslav Zárecký  */
/*  Login: xzarec02         */
/*  Date: 12.14.2024        */
/****************************/

import { View, Text, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import TopBar from '@/components/TopBar'
import SearchInput from '@/components/SearchInput'
import FriendTab from '@/components/FriendTab'
import { getAllUsersWithoutFriends, getCurrentUser, sendRequest } from '@aw/index'
import { useFocusEffect } from 'expo-router'

const createFriend = () => {

    const [isSubmit, setIsSubmit] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [usersWithoutFriends, setUsersWithoutFriends] = useState<any[] | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    
    useFocusEffect(
      React.useCallback(() => {
        fetchData();
      }, [])
    );

    //Fetch function with query
    const fetchData = async (query = '') => {
      setIsLoading(true);
  
      try {
          const user = await getCurrentUser();

          //sets user variable
          if (user) {
              setUserData(user);
          }
          

          //gets all users that are not a friend with currect user
          if (user) {
              const usersWithoutFriends = await getAllUsersWithoutFriends(query);
              setUsersWithoutFriends(usersWithoutFriends || []);
          }
      } catch (e) {
          alert(e);
      } finally {
          setIsLoading(false);
      }
      };

    //Handles request send after send friend request is pressed
    const handleRequest = async (user: any) => {
        setIsLoading(true);
  
        try{
          await sendRequest(user.$id);
          await fetchData();
        }
        catch(e){
          alert(e);
        }
        finally{
          setIsLoading(false);
        }
      };

      //Search functions
      const Search = () => {
        fetchData(searchText);
      };
      
  return (
    <SafeAreaView className="bg-mainBackground h-full">
      <TopBar/>

      <View className="h-full px-4 flex-1">
        <View className="mt-3 flex-row items-center">
          <View className="flex-1 mr-2">
              <SearchInput searchText={searchText} setSearchText={setSearchText} title="Find a person..." onSearch={Search} />
          </View>
        </View>

        {isLoading && (<ActivityIndicator size="large" color="#ffffff" />)}

        <ScrollView className="mt-2 h-full">
        {usersWithoutFriends && usersWithoutFriends.map((user) => (
          <FriendTab
            key={user.$id}
            id={user.$id}
            title={user.username}
            btnText={'Send friend request'}
            onPress={() => handleRequest(user)}
          />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default createFriend