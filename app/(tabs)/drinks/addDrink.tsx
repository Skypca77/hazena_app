/****************************/
/*  Name: Miroslav Zárecký  */
/*  Login: xzarec02         */
/*  Date: 12.14.2024        */
/****************************/

import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import TopBar from '@/components/TopBar'
import SearchInput from '@/components/SearchInput'
import { addDrinkUserSession, getActiveSession, getCurrentUser, getNonAddedDrinks, getUserSessionDrinks } from '@aw/index';
import { router, useFocusEffect } from 'expo-router'

const addDrink = () => {

    const [userData, setUserData] = useState<any | null>(null);
    const [activeSession, setActiveSession] = useState<any | null>(null);
    const [nonAddedDrinks, setNonAddedDrinks] = useState<any []| null>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [searchText, setSearchText] = useState('');
    
    useFocusEffect(
        React.useCallback(() => {
          fetchData();
        }, [])
      );


    //Fetch functions with query
    const fetchData = async (query = '') => {
        setIsLoading(true);
    
        try {
            const user = await getCurrentUser();
            if (user) {
                setUserData(user);
            }
    
            const activeSession = await getActiveSession();
            
            //Sets active session variable
            if (activeSession) {
                setActiveSession(activeSession);
            } else {
                setActiveSession(null);
            }
            
            //FEtches non added drinks to user drink session
            if (user && activeSession) {
                const nonAddedDrinks = await getNonAddedDrinks(query);
                setNonAddedDrinks(nonAddedDrinks || []);
            }
        } catch (e) {
            alert(e);
        } finally {
            setIsLoading(false);
        }
    };


    // Function which redirects after a add button is pressed
    const addDrink = async (drink: any) => {
        setIsLoading(true);
        try {
          await addDrinkUserSession(drink);
          await router.replace("/drinks");
        } catch (e) {
          alert(e);
        }
        finally{
          setIsLoading(false);
        }
      };
    
    // function called after search is pressed
    const Search = () => {
        fetchData(searchText);
    };

  return (
    <SafeAreaView className="bg-mainBackground h-full">
        <TopBar />

        <View className="h-full px-4 flex-1">
            <View className="mt-3">
                <View className="mr-2">
                    <SearchInput searchText={searchText} setSearchText={setSearchText} title="Find a drink..." onSearch={Search} />
                </View>
            </View>

            {isLoading && (<ActivityIndicator size="large" color="#ffffff"/>)}

            <ScrollView className="mt-2">
                <View className="flex-row flex-wrap justify-between w-full">
                {nonAddedDrinks && nonAddedDrinks.length > 0 ? (
                    nonAddedDrinks.map((drink) => (
                        <TouchableOpacity key={drink.$id} onPress={() => addDrink(drink)} className="w-1/2">
                            <View className="px-4 mb-2 mx-2 bg-fields rounded-lg aspect-[2/1] justify-center items-center">
                                <Text className="text-xl">{drink.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View className="flex items-center justify-center mt-4">
                        <Text className="text-gray-500">You are not in active drinking session.</Text>
                        <Text className="text-gray-500">Cannot add drinks!</Text>
                    </View>
                )}
                </View>
            </ScrollView>
        </View>
    </SafeAreaView>
  )
}

export default addDrink