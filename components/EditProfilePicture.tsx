/************************/
/*  Name: Tomáš Skýpala  */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { updateUser } from '@aw/index';

// Interface for the component props
interface EditProfileProps {
    userId: string;
    ProfilePicture: string;
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    onSave: () => void;
}

// Component to edit user profile picture
const EditProfilePicture: React.FC<EditProfileProps> = ({ userId, ProfilePicture, modalVisible, setModalVisible, onSave }) => {
    const [newProfilePicture, setNewProfilePicture] = useState(ProfilePicture || '');

    useEffect(() => {
        if (modalVisible) {
            // Set new profile picture URL when modal is visible
            setNewProfilePicture(ProfilePicture);
        }
    }, [ProfilePicture, modalVisible]);

    // Function to handle save action
    const handleSave = async () => {
        try {
            // Call updateUser function to update the user data
            await updateUser({ profile_picture: newProfilePicture }, userId);
            // Hide modal
            setModalVisible(false);
            // Trigger onSave callback
            onSave();
        } catch (error) {
            // Handle errors
            console.error('Failed to update user data:', error);
        }
    };

    // Function to handle paste action
    const handlePaste = async () => {
        try {
            // Get content from clipboard
            const clipboardContent = await Clipboard.getStringAsync();
            // Set new profile picture URL from clipboard content
            setNewProfilePicture(clipboardContent);
        } catch (error) {
            // Handle errors
            console.error('Failed to get clipboard content:', error);
        }
      };

    return (

        <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                {/* Modal Title */}
                <Text style={{ fontSize: 18, marginBottom: 10 , fontWeight: 'bold', textAlign: 'center' }}>Set new profile picture</Text>
                <View>
                    {/* Input for profile picture URL */}
                    <Text className="text-sm text-black-100">Picture url:</Text>
                    <TextInput
                        style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 }}
                        value={newProfilePicture}
                        onChangeText={setNewProfilePicture}
                        keyboardType="url"
                    />
                </View>
                {/* Button to paste URL from clipboard */}
                <TouchableOpacity onPress={handlePaste}>
                    <Ionicons name="clipboard-outline" size={24} color="black" placement="center" />
                </TouchableOpacity>
                {/* Buttons to close and save modal */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={{
                            backgroundColor: '#439ECF',
                            padding: 10,
                            borderRadius: 20,
                            alignItems: 'center',
                            marginVertical: 10,
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSave}
                        style={{
                            backgroundColor: '#439ECF',
                            padding: 10,
                            borderRadius: 20,
                            alignItems: 'center',
                            marginVertical: 10,
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>

    );
};

export default EditProfilePicture;
