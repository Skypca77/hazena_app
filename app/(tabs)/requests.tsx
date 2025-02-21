/************************/
/*  Name: Tomáš Skýpala  */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import { Text, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import PotencionalFriendTab from '@/components/PotencionalFriendTab';
import { getCurrentUser, getFriendRequestsForUser, updateFriendRequest } from '@aw/index';
import TopBar from '@/components/TopBar';

// Component to display friend requests
const Request = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);

    useEffect(() => {
        // Function to fetch friend requests
        const fetchRequests = async () => {
            // Display loading indicator
            setIsLoading(true);
            try {
                // Fetch current user
                const user = await getCurrentUser();
                if (user) {
                    // Fetch friend requests for the current user
                    const friendRequests = await getFriendRequestsForUser(user.$id);
                    setPendingRequests(friendRequests);
                }
            } catch (error) {
                // Handle errors
                console.error('Failed to fetch friend requests:', error);
            } finally {
                // Hide loading indicator
                setIsLoading(false);
            }
        };
        fetchRequests();
    }, []);

    // Function to handle accepting a friend request
    const handleAccept = async (requestId: any) => {
        // Update friend request status to 'accepted'
        await updateFriendRequest(requestId, 'accepted');
        // Remove the accepted request from the pending requests list
        setPendingRequests((prevRequests) =>
            prevRequests.filter((request) => request.$id !== requestId)
        );

    };

    const handleDecline = async (requestId: any) => {
        // Update friend request status to 'declined'
        await updateFriendRequest(requestId, 'declined');
        // Remove the declined request from the pending requests list
        setPendingRequests((prevRequests) =>
            prevRequests.filter((request) => request.$id !== requestId)
        );
      
    };
    // Display loading indicator while data is being fetched
    if (isLoading) {
        return (
            <SafeAreaView className='bg-mainBackground h-full items-center justify-start'>
                <TopBar />
                <Text className="text-white">Loading...</Text>
            </SafeAreaView>
        );
    }
    // Display message if there are no pending requests
    if (!pendingRequests.length) {
        return (
            <SafeAreaView className="bg-mainBackground h-full items-center justify-start">
                <TopBar />
                <Text className="text-white">Nothing here</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="bg-mainBackground h-full">
            <TopBar/>
            <ScrollView className="mt-2">
                {/* Display pending friend requests */}
                {pendingRequests &&
                pendingRequests.map((request) => (
                    <PotencionalFriendTab
                        key={request.$id}
                        id={request.sender_id.$id}
                        picture={request.sender_id.profile_picture}
                        name={request.sender_id.username}
                        onAccept={() => handleAccept(request.$id)}
                        onDecline={() => handleDecline(request.$id)}
                    />
                    ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Request;
