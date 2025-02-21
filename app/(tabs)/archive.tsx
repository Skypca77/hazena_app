/************************/
/*  Name: Tomáš Skýpala  */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import TopBar from '@/components/TopBar';
import { getCurrentUser, getUserSessions } from '@aw/index';

// Component to display archived sessions
const Archive = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [sessions, setSessions] = useState<any[]>([]);

    // Fetch data on component mount
    useFocusEffect(
        React.useCallback(() => {
            fetchData('');
        }, [])
    );

    // Function to fetch data for the archive
    const fetchData = async (text: string) => {
        // Display loading indicator
        setIsLoading(true);
        try {
            const user = await getCurrentUser();
            // Fetch current user
            if (user) {
                // Fetch user sessions
                const sessionsData = await getUserSessions(user.$id);
                if (Array.isArray(sessionsData)) {
                    // Filter sessions based on search text
                    const filteredSessions = text
                        ? sessionsData.filter((session) =>
                            session.session_id?.name?.toLowerCase().includes(text.toLowerCase())
                          )
                        : sessionsData;
                    setSessions(filteredSessions);
                } else {
                    // Handle invalid data
                    console.error('Expected sessionsData to be an array, but got:', sessionsData);
                }
            } else {
                // Handle invalid user data
                console.error('Failed to fetch user data');
            }
        } catch (error) {
            // Handle errors
            console.error('fetch data for archive error', error);
        } finally {
            // Hide loading indicator
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData('');
    }, []);

    // Display loading indicator while data is being fetched
    if (isLoading) {
        return (
            <SafeAreaView className='bg-mainBackground h-full items-center justify-center'>
                <ActivityIndicator size="large" color="#ffffff" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='bg-mainBackground h-full'>
            <View>
                <Text>Archive</Text>
                <Text> </Text>
            </View>

            <TopBar />

            <View className="h-full px-4 flex-1">
                <ScrollView className="mt-2">
                    {/* Display archived sessions */}
                    {sessions.map((session) => (
                        <TouchableOpacity key={session.$id} onPress={() => router.push({ pathname: `/archive/${session.session_id.$id}` })}>
                            <View className='rounded-xl bg-fields my-3 ml-2 p-4'>
                                {/* Display session name, start time and total points for active user, the time is shown in DD/MM/YYYY, HH:MM  format */}
                                <View className='flex-row justify-between'>
                                    <Text className='text-xl text-black'>
                                        {session.session_id.name} {session.session_id.session_start ? `- ${new Date(session.session_id.session_start).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}` : ''}
                                    </Text>
                                    <Text className='text-xl text-black'>
                                        {session.total_user_points}p.
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default Archive;