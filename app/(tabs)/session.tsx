/************************/
/*  Name: Jan Skovajsa  */
/*  Login: xskova01     */
/*  Date: 12.14.2024    */
/************************/

import { View, Text, Dimensions, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteInvite, getActiveSession, getCurrentUser, getSessionAttendants, getSessionInvitesForSession,
         getSessionDrinks, updateUserSessionStats, getChartData } from '@aw/index';
import { Link, router } from 'expo-router';
import TopBar from '@/components/TopBar';
import { Ionicons } from '@expo/vector-icons';

const Session = () => {
  const [userData, setUserData] = useState<any | null>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [attendantsData, setAttendantsData] = useState<any[] | null>(null);
  const [sessionDrinksData, setSessionDrinksData] = useState<any[] | null>(null);
  const [pendingInvitesData, setPendingInvitesData] = useState<any[] | null>(null);
  const [chartData, setChartData] = useState<{ labels: string[]; datasets: { data: number[] }[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const goToPendingInvites = async () => {
    try {
      router.push('/session/pending_invites');
    } catch (e) {
      alert(`Error navigating to pending invites: ${e}`);
    }
  };

  const goToSessionInvite = async () => {
    try {
      router.push('/session/session_invite');
    } catch (e) {
      alert(`Error navigating to session invite: ${e}`);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const user = await getCurrentUser();
      setUserData(user);

      const session = await getActiveSession();
      setActiveSession(session || null);

      if (session) {
        const attendants = await getSessionAttendants();
        setAttendantsData(attendants || []);

        const userSessionDrinks = await getSessionDrinks(session.$id);
        setSessionDrinksData(userSessionDrinks || []);

      const invites = await getSessionInvitesForSession();
      setPendingInvitesData(invites || []);

      const data = await getChartData(session?.$id || "");
      if (data?.labels?.length && data?.datasets?.length) {
        setChartData(data);
      } else {
        console.warn("Invalid chart data:", data);
        setChartData({ labels: [], datasets: [{ data: [] }] }); // Default empty chart
      }
    } else {
      goToPendingInvites();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    alert(`Error fetching data: ${error}`);
  } finally {
    setIsLoading(false);
  }
};

  const totalDrinks = attendantsData ? attendantsData.reduce((acc, att) => acc + (att.total_user_drink || 0), 0) : 0;
  const totalPoints = attendantsData ? attendantsData.reduce((acc, att) => acc + (att.total_user_points || 0), 0) : 0;

  const handleDeleteInvite = async (inviteId: any) => {
    setIsLoading(true);

    // remove invite from db
    await deleteInvite(inviteId);
    await fetchData();
  };

  const handleLeaveSession = async () => {
    setIsLoading(true);

    // update user session relationship to nonactive
    await updateUserSessionStats('nonactive');
    goToPendingInvites();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="bg-mainBackground h-full justify-center">
        <ActivityIndicator size="large" color="#ffffff"/>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="bg-mainBackground h-full">
      <TopBar />

      <ScrollView className="flex-1 px-4">
        <View className="my-6">
          {activeSession ? (
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="text-2xl text-white">{activeSession.name}</Text>
                <Text className="text-sm text-gray-100">
                  Today drank {totalDrinks} drinks and scored {totalPoints} points
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-center text-gray-500">There is not an active session...</Text>
          )}
        </View>

        {attendantsData
          ?.sort((a, b) => b.total_user_points - a.total_user_points)
          .map((attendant, index) => (
            <View
              key={index}
              className={`flex-row justify-between items-center p-4 rounded-lg mb-2 ${
                attendant.status === 'active' ? 'bg-gray-700 border-l-4 border-blue-500' : 'bg-gray-900'
              }`}
            >
              <Text className="text-xl text-white" style={{ width: 40, textAlign: 'right' }}>
                {index + 1}.
              </Text>
              <TouchableOpacity onPress={() => router.push(`/profile/${attendant.user_id.$id}`)}>
                <Text className="text-xl text-white" style={{ flex: 1, marginLeft: 15 }}>
                  {attendant.user_id.username}
                </Text>
              </TouchableOpacity>
              <Text className="text-xl text-white" style={{ width: 80, textAlign: 'right' }}>
                {attendant.total_user_points}
              </Text>
            </View>
          ))}

        {activeSession && (
          <TouchableOpacity onPress={goToSessionInvite}>
            <View className="rounded-xl bg-black p-4 mb-4 items-center">
              <Text className="text-xl text-white">Add +</Text>
            </View>
          </TouchableOpacity>
        )}
        <Text>Invited Users:</Text>
        {pendingInvitesData?.map((invite, index) => (
          <View key={index} className="flex-row justify-between items-center bg-gray-800 p-4 rounded-lg mb-2">
            <TouchableOpacity onPress={() => router.push(`/profile/${invite.receiver_id.$id}`)}>
              <Text className="text-xl text-white" style={{ flex: 1, marginLeft: 15 }}>
                {invite.receiver_id.username}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteInvite(invite)} className="ml-4 p-2 bg-gray-600 rounded-full">
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ))}

        {activeSession && (
          <TouchableOpacity onPress={() => handleLeaveSession()}>
            <View className="rounded-xl bg-blue-500 p-4 mb-6 items-center">
              <Text className="text-xl text-white">Leave Session</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Session;
