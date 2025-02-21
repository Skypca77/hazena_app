/****************************/
/*  Name: Miroslav Zárecký  */
/*  Name: Tomáš Skýpala     */
/*  Login: xzarec02         */
/*  Login: xskypa03         */
/*  Date: 12.15.2024        */
/****************************/

import { View, TouchableOpacity, Alert, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { getFriendRequestsForUser, getCurrentUser } from '@/lib/aw'

// Component to display the top navigation bar
const TopBar = () => {

    const [RequestsCount, setRequestsCount] = useState(0);

    // Function to fetch friend requests
    const fetchRequests = async () => {
        // Fetch current user
        const user = await getCurrentUser();
        if (!user) {
            return;
        }
        // Fetch friend requests for the current user
        const requests = (await getFriendRequestsForUser(user.$id)).length;
        // Set the count of friend requests
        setRequestsCount(requests);
    };

    // Fetch data on component mount
    useFocusEffect(
        React.useCallback(() => {
            fetchRequests();
        }, [])
    );

    useEffect(() => {
        fetchRequests();
    }, []);

    // Function to navigate to the profile page
    const goToProfile = async () => {
        try {
            router.push('/profile');
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    }
    // Function to navigate to the requests page
    const goToRequests = async () => {
        try {
            router.push('/requests');
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    }

  return (
    <View className='h-1/7 w-full flex-row justify-between bg-topTab'>
        {/* Button to navigate to the requests page */}
        <TouchableOpacity className='ml-2' onPress={goToRequests}>
            <Ionicons name="notifications" size={50} color='grey' />
            {/* Display the count of friend requests */}
            {RequestsCount > 0 && (
                <View style={{
                    position: 'absolute',
                    right: -5,
                    top: 30,
                    backgroundColor: 'red',
                    borderRadius: 15,
                    width: 25,
                    height: 25,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>{RequestsCount}</Text>
                </View>
            )}
        </TouchableOpacity>
        {/* Button to navigate to the profile page */}
        <TouchableOpacity className='mr-2' onPress={goToProfile}>
            <Ionicons name="person" size={50} color='grey' />
        </TouchableOpacity>
    </View>
  )
}

export default TopBar