import { View, Text, TouchableOpacity } from 'react-native'
import { Tabs, Redirect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Entypo, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'

const TabsLayout = () => {
  return (
    <>
        <Tabs 
        screenOptions={{
            tabBarShowLabel: true,
            tabBarActiveTintColor: '#EDE6E6',
            tabBarInactiveTintColor: '#555555',
            tabBarStyle: {
                backgroundColor: '#1C1C1C'
            }
        }}
        >
            <Tabs.Screen
                name="session"
                options={{
                    title: "Session",
                    headerShown: false,
                    tabBarIcon: ({ color }) => <MaterialIcons name="event" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="session/session_invite"
                options={{
                    title: "Invite",
                    headerShown: false,
                    href: null,
                }}
            />
            <Tabs.Screen
                name="session/pending_invites"
                options={{
                    title: "Incoming invites",
                    headerShown: false,
                    href: null,
                }}
            />
            



            <Tabs.Screen
                name="drinks"
                options={{
                    title: "Drinks",
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Entypo name="drink" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="drinks/addDrink"
                options={{
                    title: "Add Drink",
                    headerShown: false,
                    href: null,
                }}
            />




            <Tabs.Screen
                name="friends"
                options={{
                    title: "Friends",
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome5 name="user-friends" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="friends/createFriend"
                options={{
                    title: "Add friend",
                    headerShown: false,
                    href: null,
                }}
            />

            <Tabs.Screen
                name="profile/[profileId]"
                options={{
                    title: "ProfileView",
                    headerShown: false,
                    href: null,
                }}
            />

            <Tabs.Screen
                name="archive"
                options={{
                    title: "Archive",
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Entypo name="archive" size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="archive/[sessionId]"
                options={{
                    title: "ArchiveSession",
                    headerShown: false,
                    href: null,
                }}
            />



            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    href: null
                }}
            />

            <Tabs.Screen
                name="requests"
                options={{
                    title: "Requests",
                    headerShown: false,
                    href: null
                }}
            />
        </Tabs>

        <StatusBar backgroundColor="#1C1C1C" style='light'/>
    </>
  )
}

export default TabsLayout