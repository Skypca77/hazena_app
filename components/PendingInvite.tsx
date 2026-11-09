/************************/
/*  Name: Jan Skovajsa  */
/*  Login: xskova01     */
/*  Date: 12.14.2024    */
/************************/

import { getAttendantsFromSession } from '@/lib/aw';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface PendingInviteProps {
  title: string;
  onAccept: () => void;
  onDecline: () => void;
  session: { $id: string } | null;
}

interface AttendantRecord {
  total_user_points: number;
  status: string;
  user_id: {
    username: string;
  };
}

const PendingInvite = ({ title, onAccept, onDecline, session }: PendingInviteProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [attendantsData, setAttendantsData] = useState<AttendantRecord[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) {
        setAttendantsData(null);
        return;
      }

      const attendants = await getAttendantsFromSession(session);
      const typedAttendants = (attendants as unknown as AttendantRecord[] | undefined) ?? null;
      setAttendantsData(typedAttendants);
    };
    fetchData();
  }, [session]);

  const toggleModal = () => setIsModalVisible(!isModalVisible);

  return (
    <View className="w-full flex-row items-center justify-between rounded-xl mb-3 bg-fields p-2">
      <TouchableOpacity onPress={toggleModal}>
        <Text className="text-2xl">{title}</Text>
      </TouchableOpacity>

      <View className="flex-row space-x-2">
        <TouchableOpacity onPress={onAccept}>
          <View className="px-4 py-2 rounded-xl bg-green-500">
            <Text className="text-white">Accept</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onDecline}>
          <View className="px-4 py-2 rounded-xl bg-red-500">
            <Text className="text-white">Decline</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View className="flex-1 items-center justify-center bg-black bg-opacity-50">
          <View className="w-4/5 p-5 bg-white rounded-xl">
            <Text className="text-xl font-bold mb-4">Invite Details</Text>
            <Text className="text-lg mb-4">{title}</Text>

            {attendantsData &&
              attendantsData
                .slice()
                .sort((a: AttendantRecord, b: AttendantRecord) => b.total_user_points - a.total_user_points)
                .map((attendant: AttendantRecord, index: number) => (
                  <View
                    key={index}
                    className={`flex-row justify-between items-center p-4 rounded-lg mb-2 ${
                      attendant.status === 'active' ? 'bg-gray-700 border-l-4 border-blue-500' : 'bg-gray-900'
                    }`}
                  >
                    <Text className="text-xl text-white" style={{ flex: 1, marginLeft: 15 }}>
                      {attendant.user_id.username}
                    </Text>
                  </View>
                ))}

            <View className="flex-row justify-around mt-4">
              <TouchableOpacity
                onPress={() => {
                  onAccept();
                  toggleModal();
                }}
              >
                <View className="px-4 py-2 rounded-xl bg-green-500">
                  <Text className="text-white">Accept</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onDecline();
                  toggleModal();
                }}
              >
                <View className="px-4 py-2 rounded-xl bg-red-500">
                  <Text className="text-white">Decline</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={toggleModal} className="mt-4">
              <View className="px-4 py-2 rounded-xl bg-gray-300">
                <Text className="text-center text-black">Close</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PendingInvite;
