/************************/
/*  Name: Jan Skovajsa  */
/*  Login: xskova01     */
/*  Date: 12.14.2024    */
/************************/

import React, { useState } from 'react';
import { SafeAreaView, Text, View, TextInput, Modal, TouchableOpacity, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addSession, addUserSession, getCurrentUser, getSessionInvitesForUser, updateInvite } from '@/lib/aw/index';
import { router, useFocusEffect } from 'expo-router';
import TopBar from '@/components/TopBar';

const PendingInvites = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any | null>(null);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionPlace, setNewSessionPlace] = useState('');
  const [newSessionDate, setNewSessionDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<any[] | null>(null);

  const goToSession = async () => {
    try {
      router.push('/session');
    } catch (e) {
      alert(`Error navigating to session invite: ${e}`);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      fetchData();
      setIsLoading(false);
    }, [])
  );

  const fetchData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) setUserData(user);

      const invites = user ? await getSessionInvitesForUser(user) : [];
      setPendingInvites(invites || []);
    } catch (error) {
      alert(error);
    }
  }

  const handleAccept = async (session: any, invite: any) => {
    setIsLoading(true);
    try{
      // create user session relationship
      await addUserSession(session);
      // set invite to accepted
      await updateInvite(invite, 'accepted');
      // redirect to session
      goToSession();
    } catch (error){
      alert(error);
    }finally{
      setIsLoading(false);
    }
    
  };

  const handleDecline = async (session: any, invite: any) => {
    // set invite to declined
    await updateInvite(invite, 'declined');
    fetchData();
  };

  const handleCreateSession = async () => {
    // if name not provided use place
    const name = newSessionName.trim() || `${newSessionPlace.trim()}`;
    if (!name) return alert('Specify name or place');
    
    // create session
    const session = await addSession(name, newSessionDate.toISOString(), newSessionPlace.trim());

    // add this user to newly created session
    await addUserSession(session);

    // reset fields
    setNewSessionName('');
    setNewSessionPlace('');
    setNewSessionDate(new Date());
    setIsModalVisible(false);

    // redirect
    goToSession();
  };

  const handleDateChange = (date: Date | null) => {
    if (date) setNewSessionDate(date);
  };

  return (
    <SafeAreaView className="flex-1 bg-mainBackground">
      <View>
          <Text>pending</Text>
          <Text> </Text>
      </View>
      <TopBar />

      <View className="mt-3">
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="bg-buttonBlue rounded-xl py-3 items-center"
        >
          <Text className="text-white text-xl">New Session</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="mt-4 px-4">
        {!isLoading && pendingInvites && pendingInvites.length > 0 ? (
          pendingInvites.map((invite) => (
            <View key={invite.$id} className="flex-row justify-between items-center bg-gray-800 p-4 rounded-lg mb-2">
              <View className="flex-1">
                <Text className="text-xl text-white">{invite.session_id.name || 'Unnamed Session'}</Text>
                <Text className="text-sm text-gray-300">From: {invite.sender_id.username}</Text>
              </View>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => handleAccept(invite.session_id, invite)}
                  className="px-4 py-2 rounded-lg bg-green-500"
                >
                  <Text className="text-white">Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDecline(invite.session_id, invite)}
                  className="px-4 py-2 rounded-lg bg-red-500"
                >
                  <Text className="text-white">Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-center text-gray-400 mt-10">No pending invites</Text>
        )}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black bg-opacity-50">
          <View className="w-11/12 p-6 bg-white rounded-xl max-h-[80%]">
            <Text className="text-xl font-bold mb-4">Create New Session</Text>

            <TextInput
              placeholder="Enter session name"
              value={newSessionName}
              onChangeText={setNewSessionName}
              className="border border-gray-300 rounded-lg p-3 mb-4 text-lg"
            />

            <TextInput
              placeholder="Enter session place"
              value={newSessionPlace}
              onChangeText={setNewSessionPlace}
              className="border border-gray-300 rounded-lg p-3 mb-4 text-lg"
            />

            <Text className="mb-2">Select Date:</Text>
            {Platform.OS === 'web' ? (
              <DatePicker
                selected={newSessionDate}
                onChange={handleDateChange}
                showTimeSelect
                dateFormat="Pp"
                className="border border-gray-300 rounded-lg p-3 mb-4 text-lg"
              />
            ) : (
              <TouchableOpacity
                onPress={() => setIsDatePickerVisible(true)}
                className="border border-gray-300 rounded-lg p-3 mb-4 text-lg"
              >
                <Text>{newSessionDate.toLocaleString()}</Text>
              </TouchableOpacity>
            )}

            {isDatePickerVisible && Platform.OS !== 'web' && (
              <DateTimePicker
                value={newSessionDate}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || newSessionDate;
                  setIsDatePickerVisible(false);
                  handleDateChange(currentDate);
                }}
              />
            )}

            <View className="flex-row justify-around mt-4">
              <TouchableOpacity onPress={handleCreateSession}>
                <View className="px-4 py-2 rounded-xl bg-green-500">
                  <Text className="text-white">Create</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <View className="px-4 py-2 rounded-xl bg-gray-300">
                  <Text className="text-black">Cancel</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PendingInvites;
