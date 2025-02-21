/************************/
/*  Name: Tomáš Skýpala */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from 'react-native'
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons';
import { getCurrentUser, calculateAlcoholDataMultipleDrinks, getActiveSession, sign_out } from '@aw/index';
import BloodAlkTable from '@/components/BloodAlkTable';
import TopBar from '@/components/TopBar';
import EditProfile from '@/components/EditProfile';
import EditProfilePicture from '@/components/EditProfilePicture';
import CustomButton from '@/components/CustomButton';
import { router, useFocusEffect } from 'expo-router';

// Component to display user profile
const Profile = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<any | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPictureVisible, setModalPictureVisible] = useState(false);
    const [newAge, setNewAge] = useState('');
    const [newHeight, setNewHeight] = useState('');
    const [newWeight, setNewWeight] = useState('');
    const [newGender, setNewGender] = useState('');
    const [newProfilePicture, setNewProfilePicture] = useState('');
    const [session, setSession] = useState<any | null>(null);
    const [drinksData, setDrinksData] = useState<any[]>([]);
    const [isSubmit, setIsSubmit] = useState(false)

    // Function to fetch data for the profile
    const fetchData = async () => {
        // Display loading indicator
        setIsLoading(true);
        try {
            // Fetch current user
            const user = await getCurrentUser();
            if (user) {
                setUserData(user);
                setNewAge(user.age);
                setNewHeight(user.height);
                setNewWeight(user.weight);
                setNewGender(user.gender);
                setNewProfilePicture(user.profile_picture);
                // Fetch active session data
                const activeSession = await getActiveSession();
                setSession(activeSession);
                if (activeSession) {
                    // Calculate alcohol data for user in the active session
                    const alcoholData = await calculateAlcoholDataMultipleDrinks({
                        userid: user.$id,
                        sessionid: activeSession.$id,
                        weight: user.weight,
                        gender: user.gender,
                        sessionStartTime: activeSession.session_start
                    });
                    setDrinksData(alcoholData.drinksData || []);
                }
            }
        } catch (error) {
            // Handle errors
            console.error('Failed to fetch user data:', error);
        } finally {
            // Hide loading indicator
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch data on component mount
    useFocusEffect(
        React.useCallback(() => {
          fetchData();
        }, [])
      );

    // Function to handle profile update
    const handleProfileUpdate = () => {
        fetchData();
    };

    // Function to handle sign out
    const submit = async () => {
        setIsSubmit(true);
    
        try {
          await sign_out();
    
          router.replace('/sign_in');
        } catch (e) {
          alert(e);
        }
        finally {
          setIsSubmit(false);
        }
      }

    // Display loading indicator while data is being fetched
    if (isLoading) {
        return (
            <SafeAreaView className='bg-mainBackground h-full items-center justify-center'>
                <Text className="text-white">Loading...</Text>
            </SafeAreaView>
        );
    }

    // Display error message if user data is not available
    if (!userData) {
        return (
            <SafeAreaView className='bg-mainBackground h-full items-center justify-center'>
                <Text className="text-white">Failed to load user data.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='bg-mainBackground h-full'>
            <TopBar/>
            
            <ScrollView className={'flex-1 px-4'}>
                {/* Display user profile data */}
                {/* Displaying the profile picture and username. The profile picture can be edited in press */}
                <View className="mt-3 items-center flex-row">
                    <TouchableOpacity onPress={() => setModalPictureVisible(true)}>
                        <Image
                            source={{ uri: userData.profile_picture }}
                            style={{ width: 100, height: 100, borderRadius: 50 }}
                        />
                    </TouchableOpacity>
                    <Text className="text-2xl text-white">   {userData.username ? userData.username : 'Anonymous'}</Text>
                </View>
                {/* Displaying user details. Email, age, height, weight, gender */}
                <View className="mt-3">
                    <Text className="text-sm text-gray-100">Email: {userData.email}</Text>
                    <Text className="text-sm text-gray-100">Age: {userData.age}</Text>
                    <Text className="text-sm text-gray-100">Height: {userData.height}</Text>
                    <Text className="text-sm text-gray-100">Weight: {userData.weight}</Text>
                    <View className="flex-row items-center space-x-2">
                        <Text className="text-sm text-gray-100" style={{ flex: 1 }}>Gender: {userData.gender}</Text>
                        {/* Button to edit user profile */}
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            style={{ borderRadius: 20, overflow: 'hidden', alignSelf: 'flex-end'  }}
                        >
                            <Ionicons name="pencil" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Displaying drint that the user druk in the courent session */}
                {drinksData.length > 0 && (
                    <>
                        <Text className="text-2xl text-white mt-3">Drinks:</Text>
                        {drinksData.map((drink, index) => (
                            <View key={drink.$id || index} className='rounded-xl bg-fields my-3 ml-2 p-4'>
                                <View className='flex-row justify-between'>
                                    <Text className='text-xl text-black'>
                                        1x {drink.name}
                                    </Text>
                                    <Text className='text-xl text-black'>
                                        {new Date(drink.drink_time).toLocaleTimeString('en-GB')}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}
                {/* Button to sign out */}
                <CustomButton
                    title="Sign Out"
                    handlePress={submit}
                    containerStyles="bg-blue-300 mt-7"
                    isLoading={isSubmit}
                    textStyles=""
            />
            </ScrollView>
            {/* Modal to edit user profile */}
            <EditProfile 
                userId={userData.$id}
                Age={newAge} 
                Height={newHeight} 
                Weight={newWeight} 
                Gender={newGender} 
                modalVisible={modalVisible} 
                setModalVisible={setModalVisible}
                onSave={handleProfileUpdate}
            />
            {/* Modal to edit user profile picture */}
            <EditProfilePicture 
                userId={userData.$id}
                ProfilePicture={newProfilePicture}
                modalVisible={modalPictureVisible} 
                setModalVisible={setModalPictureVisible}
                onSave={handleProfileUpdate}
            />

        </SafeAreaView>
    );
}

export default Profile