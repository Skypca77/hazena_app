/****************************/
/*  Name: Miroslav Zárecký  */
/*  Login: xzarec02         */
/*  Date: 12.14.2024        */
/****************************/

import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import SearchInput from '@/components/SearchInput'
import { Ionicons } from '@expo/vector-icons'
import FriendTab from '@/components/FriendTab'
import TopBar from '@/components/TopBar'
import { addInvite, getActiveSession, getFriends, getSessionAttendants, getInvitableFriends } from '@/lib/aw/index'
import { router, useFocusEffect } from 'expo-router'

const session_invite = () => {

    const [searchText, setSearchText] = useState('');
    const [friendData, setFriendData] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useFocusEffect(
      React.useCallback(() => {
        fetchData();
      }, [])
    );

    //fetch fucntion with query
    const fetchData = async (query = '') => {
      setIsLoading(true);
      try {
        // fetch friends of currentUser that are not already invited
        const filteredFriends = await getInvitableFriends(query);
      
        setFriendData(filteredFriends);
      } catch (error) {
        alert(error);
      }
      finally {
        setIsLoading(false);
      }
    }


    //Handles sending invite after user presses inviter button
    const handleInvite = async (friend: any) => {
      setIsLoading(true);

      // create invite
      try{
        await addInvite(friend);
        await fetchData();
      }
      catch(e){
        alert(e);
      }
      finally{
        setIsLoading(false);
      }
      
      //refresh
    };

    //search function
    const Search = () => {
      fetchData(searchText);
    };

  return (
    <SafeAreaView className="bg-mainBackground h-full">
      <TopBar/>

      <View className="h-full px-4 flex-1">
        <View className="mt-3">
            <SearchInput searchText={searchText} setSearchText={setSearchText} title="Find a friend to invite..." onSearch={Search}/>
        </View >

        {isLoading && (<ActivityIndicator size="large" color="#ffffff"/>)}
      
        {!isLoading && (<ScrollView className="mt-2">
          {friendData && friendData.map((friend) => (
              <FriendTab
                  id={friend.$id}
                  key={friend.$id}
                  title={friend.username}
                  btnText={'Invite'}
                  onPress={() => handleInvite(friend)}
              />
          ))}
      </ScrollView>)}
      </View>
    </SafeAreaView>
  )
}

export default session_invite