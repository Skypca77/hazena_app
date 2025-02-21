/************************/
/*  Name: Tomáš Skýpala  */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import { View, Text, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPastSessionAttendants, getSessionDrinks, getSession, getActiveSession, inviteAll } from '@aw/index';
import { useLocalSearchParams } from 'expo-router';
import TopBar from '@/components/TopBar';
import { router, useFocusEffect } from 'expo-router';
import SetUpSession from '@/components/SetUpSession';

// View to display archived session
const ArchiveSession = () => {
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const [attendantsData, setAttendantsData] = useState<any[] | null>(null);
    const [sessionDrinksData, setSessionDrinksData] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState<any | null>(null);
    const [isDrinksListVisible, setIsDrinksListVisible] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeSession, setActiveSession] = useState<any | null>(null);
    // Fetch data for the archived session
    const fetchData = async () => {
        // Check if sessionId was passed
        if (!sessionId) {
            console.error('Session ID is not available');
            return;
        }
        
        // Display loading indicator
        setIsLoading(true);
        
        try {

            // Fetching the whole session from the database
            const session = await getSession(sessionId);
            if (session) {
                setSession(session);
            }

            // Fetching attendants in the session
            const attendants = await getPastSessionAttendants(sessionId);
            setAttendantsData(attendants || []);

            // Fetching drinks in the session
            const userSessionDrinks = await getSessionDrinks(sessionId);

            // Filter out drinks with quantity 0
            const filteredDrinks = userSessionDrinks.filter((drink) => drink.quantity !== 0);
            setSessionDrinksData(filteredDrinks);

            const activeSession = await getActiveSession();
            setActiveSession(activeSession);
            console.log(activeSession);

            
        } catch (error) {
            // Handle errors
            console.error('Failed to retrieve data:', error);
        } finally {
            // Hide loading indicator
            setIsLoading(false);
        }
    };

    // Fetch data on component mount
    useFocusEffect(
        React.useCallback(() => {
            fetchData();
            setIsCopied(false);
        }, [sessionId])
    );

    useEffect(() => {
        fetchData();
    }, [sessionId]);

    const handleCopySession = async () => {
        // Bool to change the button to "Copied"
        setIsCopied(true);
    }

    const handleInviteAll = async () => {
        // Bool to change the button to "Copied"
        inviteAll(sessionId);
        handleCopySession();
    }

    // Display loading indicator
    if (isLoading) {
        return (
            <SafeAreaView className='bg-mainBackground h-full items-center justify-center'>
                <ActivityIndicator size="large" color="#ffffff" />
            </SafeAreaView>
        );
    }

    // Display error message if session data is not available
    if (!session) {
        return (
            <SafeAreaView className='bg-mainBackground h-full items-center justify-center'>
                <Text className="text-white">Failed to load session data.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='bg-mainBackground h-full'>
            <TopBar />
            <ScrollView className="p-4">
                {/* Display session name and start time */}
                <Text className='text-2xl text-white'>{session.name}</Text>
                <Text className='text-xl text-gray-100'>Place: {session.place}</Text>
                <Text className='text-xl text-gray-100'>
                    Start: {new Date(session.session_start).toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </Text>
                {/* Button to display or hide drinks drank in that session */}
                <View className="mt-4">
                    <Button title={isDrinksListVisible ? "Hide Drinks" : "Show Drinks"} onPress={() => setIsDrinksListVisible(!isDrinksListVisible)} />
                    {isDrinksListVisible && sessionDrinksData && (
                        <View className="mt-4">
                            {sessionDrinksData.map((drink) => (
                                <View key={drink.$id} className='rounded-xl bg-fields my-3 p-4'>
                                    <Text className='text-xl text-black'>{drink.name}</Text>
                                    <Text className='text-xl text-black'>{drink.quantity}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                {/* Display attendants in the session with their points */}
                {attendantsData ? (
                    attendantsData
                        .sort((a, b) => b.total_user_points - a.total_user_points)
                        .map((attendant, index) => {
                            const isActive = attendant.status === 'active';

                            return (
                                <View className='rounded-xl bg-fields my-3 ml-2 p-4'>
                                    <View className='flex-row justify-between'>
                                        <TouchableOpacity onPress={() => router.push(`/profile/${attendant.user_id.$id}`)}>
                                            <Text className='text-xl text-black'>
                                                {attendant.user_id.username}
                                            </Text>
                                        </TouchableOpacity>
                                        <Text className="text-xl text-black" style={{ width: 80, textAlign: 'right' }}>
                                            {attendant.total_user_points}
                                        </Text>
                                    </View>
                                </View>
                            );
                      })
                ) : (
                    <Text className="text-center text-gray-400 text-lg">Loading attendants...</Text>
                )}
                {/* Button to copy the session */}
                {isCopied && (
                    <View className="rounded-xl bg-green-500 p-4 mb-6 items-center">
                        <Text className="text-xl text-white">Copied</Text>
                    </View>
                )}
                {!isCopied && activeSession == null && (
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <View className="rounded-xl bg-blue-500 p-4 mb-6 items-center">
                            <Text className="text-xl text-white">Copy</Text>
                        </View>
                    </TouchableOpacity>
                )}
                {!isCopied && activeSession != null && (
                    <TouchableOpacity onPress={() => handleInviteAll()}>
                        <View className="rounded-xl bg-blue-500 p-4 mb-6 items-center">
                            <Text className="text-xl text-white">Copy</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </ScrollView>
            {/* Modal to setup a new session */}
            <SetUpSession 
                SessionId={sessionId}
                Name={session.name} 
                Place={session.place} 
                Time={session.session_start} 
                modalVisible={modalVisible} 
                setModalVisible={setModalVisible}
                onSave={handleCopySession}
            />
        </SafeAreaView>
    );
};

export default ArchiveSession;