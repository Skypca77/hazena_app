/************************/
/*  Name: Tomáš Skýpala  */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context'
import { getUser, getActiveSession, getUserSessionDrinksWithoutQuery, isFriend, uprateFriendRequest, getCurrentUser, getAttendantsFromSession} from '@aw/index';
import TopBar from '@/components/TopBar';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

const ProfileView = () => {
    const { profileId } = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<any | null>(null);
    const [drinksData, setDrinksData] = useState<any[]>([]);
    const [friendStatus, setFriendStatus] = useState('not_friends');
    const [activeUserStatus, setActiveUserStatus] = useState('not_friends');

    // Fetch data on component mount
    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [profileId])
    );

    // Function to fetch data for the profile
    const fetchData = async () => {
        // Display loading indicator
        setIsLoading(true);
        try {
            // Fetch current user
            const activeUser = await getCurrentUser();
            if (activeUser){
                // If the profile belongs to the current user, redirect to their profile
                if (activeUser.$id === profileId) {
                    try {
                        router.push('/profile');
                    } catch (error) {
                        if (error instanceof Error) {
                            Alert.alert('Error', error.message);
                        } else {
                            Alert.alert('Error', 'An unknown error occurred');
                        }
                    }
                }
                // Check if the current user is friends with the profile user
                const friends = await isFriend(profileId, activeUser.$id);
                if (friends && friends !== 'error') {
                    setFriendStatus(friends.status || 'not_friends');
                    setActiveUserStatus(friends.active_user_status);
                } else {
                    setFriendStatus('not_friends');
                    setActiveUserStatus('not_friends');
                }
            }
            /* This is to display drinks that the user whom we are viewing drank in the 
               session that he is in and is an active session for the actual user */
            // Fetch profile user data
            const user = await getUser(profileId);
            if (user) {
                setUserData(user);
                // Fetch active session data
                const activeSession = await getActiveSession();
                if (activeSession) {
                    // Fetch attendants of the active session
                    const attendants = await getAttendantsFromSession(activeSession);
                    if (attendants && attendants.some(attendant => attendant.user_id.$id === profileId)) {
                        // Fetch drinks data for the profile user in the active session
                        const drinks = await getUserSessionDrinksWithoutQuery(profileId, activeSession.$id);
                        if (drinks) {     
                            const filteredDrinks = drinks.filter((drink) => drink.quantity !== 0);
                            setDrinksData(filteredDrinks);
                        }
                    }
                }
            }
        } catch (error) {
            // Handle errors
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('An unknown error occurred');
            }
        } finally {
            // Hide loading indicator
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [profileId]);

    // Functions to handle send of friend requests
    const handleSendFriendRquest = async () => {
        try {
            await uprateFriendRequest(profileId, 'pending');
            // Okamžitě nastavíme nový stav:
            setFriendStatus('pending');
            setActiveUserStatus('sender');
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    };

    // Functions to handle decline of friend requests and unfriending
    const handleUnFriend = async () => {
        try {
            await uprateFriendRequest(profileId, 'declined');
            // Okamžitě nastavíme nový stav:
            setFriendStatus('not_friends');
            setActiveUserStatus('not_friends');
        } catch (error) {
            console.error("Error unfriending:", error);
        }
    };

    // Functions to handle accept of friend requests
    const handleAccept = async () => {
        try {
            await uprateFriendRequest(profileId, 'accepted');
            // Okamžitě nastavíme nový stav:
            setFriendStatus('accepted');
            setActiveUserStatus('receiver');
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    };

    // Loading
    if (isLoading) {
        return (
            <SafeAreaView className='bg-mainBackground h-full items-center justify-center'>
                <Text className="text-white">Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='bg-mainBackground h-full'>
            <TopBar/>
            
            <ScrollView className={'flex-1 px-4'}>
                {/* Displaying basic user information */}
                {/* Displaying image and name of the user */}
                <View className="mt-3 items-center flex-row">
                    <Image
                        source={{ uri: userData.profile_picture }}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                    />
                    <Text className="text-2xl text-white">   {userData.username ? userData.username : 'Anonymous'}</Text>
                </View>
                {/* Displaying age and gender of the user */}
                <View className="mt-3">
                    <Text className="text-sm text-gray-100">Age: {userData.age}</Text>
                    <Text className="text-sm text-gray-100" style={{ flex: 1 }}>Gender: {userData.gender}</Text>
                </View>
                {/* Display of the buttons depending on the user's friend status */}
                {(friendStatus === 'declined' || friendStatus === 'not_friends') && (<TouchableOpacity onPress={() => handleSendFriendRquest()}>
                    <View className="rounded-xl bg-blue-500 p-4 mb-6 items-center">
                        <Text className="text-xl text-white">Add friend</Text>
                    </View>
                </TouchableOpacity>
                )}
                {friendStatus === 'accepted' && (<TouchableOpacity onPress={() => handleUnFriend()}>
                    <View className="rounded-xl bg-red-500 p-4 mb-6 items-center">
                        <Text className="text-xl text-white">Remove friend</Text>
                    </View>
                </TouchableOpacity>
                )}
                {friendStatus === 'pending' && activeUserStatus === 'sender' && (<View className="rounded-xl bg-yellow-500 p-4 mb-6 items-center">
                    <Text className="text-xl text-white">Waiting for an answer</Text>
                    </View>
                )}
                {friendStatus === 'pending' && activeUserStatus === 'receiver' && (
                        <View className="flex-row space-x-2 mb-6">
                        <Text className="text-xl text-white">Waiting for an answer for a friend request:</Text>
                        <TouchableOpacity onPress={() => handleAccept()}>
                            <View className="px-4 py-2 rounded-xl bg-green-500 items-center">
                                <Ionicons name="checkmark" size={24} color="black" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleUnFriend()}>
                            <View className="px-4 py-2 rounded-xl bg-red-500 items-center">
                                <Ionicons name="close" size={24} color="black" />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
                
                {/* Display of the drinks that the user drank in session if the courent user and displayed user are in the same session */}
                {drinksData.length > 0 && (
                    <>
                        <View className="mt-3">
                            <Text className="text-2xl text-white mt-3">Drinks:</Text>
                            {drinksData.map((drink) => (
                                <View key={drink.$id} className='rounded-xl bg-fields my-3 ml-2 p-4'>
                                    <View className='flex-row justify-between'>
                                        <Text className='text-xl text-black'>
                                            {drink.quantity}x {drink.drink.name}
                                        </Text>
                                        <Text className='text-xl text-black'>
                                            {new Date(drink.$createdAt).toLocaleTimeString('en-GB')}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );

}
export default ProfileView;