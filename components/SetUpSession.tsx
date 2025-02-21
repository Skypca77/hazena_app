/************************/
/*  Name: Tomáš Skýpala  */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CopySession } from '@aw/index';

// Interface for the component props
interface SetUpSession {
    SessionId: string;
    Name: string;
    Place: string;
    Time: Date;
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    onSave: () => void;
}

// Component to edit user profile
const SetUpSession: React.FC<SetUpSession> = ({ SessionId, Name, Place, Time, modalVisible, setModalVisible, onSave }) => {
    const [newName, setNewName] = useState(Name || '');
    const [newPlace, setNewPlace] = useState(Place || '');
    const [newTime, setNewTime] = useState(Time || new Date());
    const [dateModalVisible, setDateModalVisible] = useState(false);


    useEffect(() => {
        if (modalVisible) {
            setNewName(Name);
            setNewPlace(Place);
            const now = new Date();
            const sessionStartTime = new Date(Time);
            const start_time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sessionStartTime.getHours(), sessionStartTime.getMinutes(), sessionStartTime.getSeconds());
            setNewTime(start_time);
        }
      }, [Name, Place, Time, modalVisible]);

    // Function to handle save action
    const handleSave = async () => {
        try {
            // Copy the session
            await CopySession(SessionId, newName, newPlace, newTime);
            // Hide modal
            setModalVisible(false);
            // Trigger onSave callback
            onSave();
        } catch (error) {
            // Handle errors
            console.error('Failed to update user data:', error);
        }
    };

    const handleDateChange = (date: Date | null) => {
        if (date) setNewTime(date);
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
            <View style={{ width: 370, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
                <Text style={{ fontSize: 18, marginBottom: 10 , fontWeight: 'bold', textAlign: 'center' }}>Copy Profile</Text>
                <View>
                    <Text className="text-sm text-black-100">Name:</Text>
                    <TextInput
                        style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 }}
                        value={newName}
                        onChangeText={setNewName}
                        keyboardType="default"
                    />
                    <Text className="text-sm text-black-100">Place:</Text>
                    <TextInput
                        style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 }}
                        value={newPlace}
                        onChangeText={setNewPlace}
                        keyboardType="default"
                    />
                    <Text className="text-sm text-black-100">Time:</Text>
                    {Platform.OS === 'web' ? (
                        <DatePicker
                            selected={newTime}
                            onChange={handleDateChange}
                            showTimeSelect
                            dateFormat="Pp"
                            className="border border-gray-300 rounded-lg p-3 mb-4 text-lg"
                        />
                        ) : (
                        <TouchableOpacity
                            onPress={() => setDateModalVisible(true)}
                            className="border border-gray-300 rounded-lg p-3 mb-4 text-lg"
                        >
                            <Text>{newTime.toLocaleString()}</Text>
                        </TouchableOpacity>
                        )}

                        {dateModalVisible && Platform.OS !== 'web' && (
                        <View style={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 2 }}>
                            <DateTimePicker
                                value={newTime}
                                mode="datetime"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    // Zavřeme picker pokaždé, když uživatel něco udělá
                                    setDateModalVisible(false);
                            
                                    // Pokud je vybrané datum `null`, uživatel stiskl Storno
                                    if (!selectedDate) {
                                        console.log("User dismissed the picker.");
                                        return;
                                    }
                            
                                    // Pokud uživatel vybral datum, aktualizujeme hodnotu
                                    handleDateChange(selectedDate);
                                }}
                            />
                        </View>
                    )}
                </View>
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

export default SetUpSession;
