/************************/
/*  Name: Tomáš Skýpala  */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native'
import { updateUser } from '@aw/index';

// Interface for the component props
interface EditProfileProps {
    userId: string;
    Age: string;
    Height: string;
    Weight: string;
    Gender: string;
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    onSave: () => void;
}

// Component to edit user profile
const EditProfile: React.FC<EditProfileProps> = ({ userId, Age, Height, Weight, Gender, modalVisible, setModalVisible, onSave }) => {
    const [newAge, setNewAge] = useState(Age || '');
    const [newHeight, setNewHeight] = useState(Height || '');
    const [newWeight, setNewWeight] = useState(Weight || '');
    const [newGender, setNewGender] = useState(Gender || '');
    const [genderModalVisible, setGenderModalVisible] = useState(false);

    // const genderOptions = ['Male', 'Female'];

    useEffect(() => {
        if (modalVisible) {
            setNewAge(Age);
            setNewHeight(Height);
            setNewWeight(Weight);
            setNewGender(Gender);
        }
      }, [Age, Height, Weight, Gender, modalVisible]);

    // Function to handle save action
    const handleSave = async () => {
        try {
            // Call updateUser function to update the user data
            await updateUser({ age: parseInt(newAge), height: parseInt(newHeight), weight: parseInt(newWeight), gender: newGender }, userId);
            // Hide modal
            setModalVisible(false);
            // Trigger onSave callback
            onSave();
        } catch (error) {
            // Handle errors
            console.error('Failed to update user data:', error);
        }
    };
    //Modal to edit user profile
    return (
        <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                {/* Modal Name */}
                <Text style={{ fontSize: 18, marginBottom: 10 , fontWeight: 'bold', textAlign: 'center' }}>Edit Profile</Text>
                <View>
                    {/* Age box*/}
                    <Text className="text-sm text-black-100">Age:</Text>
                    <TextInput
                        style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 }}
                        value={newAge}
                        onChangeText={setNewAge}
                        keyboardType="numeric"
                    />
                    {/* Height box */}
                    <Text className="text-sm text-black-100">Height:</Text>
                    <TextInput
                        style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 }}
                        value={newHeight}
                        onChangeText={setNewHeight}
                        keyboardType="numeric"
                    />
                    {/* Weight box */}
                    <Text className="text-sm text-black-100">Weight:</Text>
                    <TextInput
                        style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 }}
                        value={newWeight}
                        onChangeText={setNewWeight}
                        keyboardType="numeric"
                    />
                    {/* Gender box with modal box*/}
                    <Text className="text-sm text-black-100">Gender:</Text>
                    <TouchableOpacity
                        style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 10 }}
                        onPress={() => setGenderModalVisible(true)}
                    >
                        <Text>{newGender || 'Select Gender'}</Text>
                    </TouchableOpacity>
                </View>
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
            {/* Modal for selecting gender */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={genderModalVisible}
                onRequestClose={() => setGenderModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ width: 250, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                        <Text style={{ fontSize: 18, marginBottom: 10 }}>Select Gender</Text>
                        {['male', 'female'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => {
                                    setNewGender(option);
                                    setGenderModalVisible(false);
                                }}
                                style={{ padding: 10, alignItems: 'center', borderBottomWidth: 1, borderColor: 'lightgray' }}
                            >
                                <Text style={{ fontSize: 16 }}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => setGenderModalVisible(false)}
                            style={{ backgroundColor: '#439ECF', padding: 10, borderRadius: 20, alignItems: 'center', marginTop: 10 }}
                        >
                            <Text style={{ color: 'white', fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    </Modal>

    );
};

export default EditProfile;
