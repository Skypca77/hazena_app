/****************************/
/*  Name: Miroslav Zárecký  */
/*  Login: xzarec02         */
/*  Date: 12.14.2024        */
/****************************/

import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import DrinkTab from '@/components/DrinkTab'
import SearchInput from '../../components/SearchInput';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getActiveSession, getCurrentUser, getUserSessionDrinks, getUserSessionOneDrink, minusUserDrinkSessionCount, plusUserDrinkSessionCount, updateUserSessionStats } from '@aw/index';
import TopBar from '@/components/TopBar';
import { router, useFocusEffect } from 'expo-router';

const Drinks = () => {
  const [userData, setUserData] = useState<any | null>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [userDrinks, setUserDrinks] = useState<any []| null>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [IsGoToAddDrink, setIsGoToAddDrink] = useState(false)

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  //fetch function with query
  const fetchData = async (query = '') => {
    setIsLoading(true);

    try {
      const user = await getCurrentUser();

      //sets user variable
      if (user) {
        setUserData(user);
      }

      //gets active session of the currect user
      const activeSession = await getActiveSession();

      //sets active session variable
      if (activeSession) {
        setActiveSession(activeSession);
      } else {
        setActiveSession(null);
      }

      //gets user session drinks
      if (user && activeSession) {
        const userDrinks = await getUserSessionDrinks(user.$id, activeSession.$id, query);
        setUserDrinks(userDrinks || []);
      }
    } catch (e) {
      alert(e);
    } finally {
      setIsLoading(false);
    }
  };


  //function for fetching only one drink that is updated with increment
  const fetchDataOneDrink = async (drinkId: any) => {
    setIsLoading(true);

    try {
      const user = await getCurrentUser();
      if (user) {
        setUserData(user);
      }

      const activeSession = await getActiveSession();

      if (activeSession) {
        setActiveSession(activeSession);
      } else {
        setActiveSession(null);
      }

      if (user && activeSession && drinkId) {
        const updatedDrink = await getUserSessionOneDrink(user.$id, activeSession.$id, drinkId);


        if (updatedDrink) {
          setUserDrinks((prevDrinks: any) => 
            prevDrinks.map((drink: any) => {
              if (drink.drink.$id === drinkId) {
                return { ...drink, quantity: updatedDrink.quantity };
              }
              return drink;
            })
          );
        };
      }
    } catch (e) {
      alert(e);
    } finally {
      setIsLoading(false);
    }
  };

  //handles after + button is pressed
  const handlePlusCount = async (userDataID: any, activeSessionId: any, drinkId: any) => {
    setIsLoading(true);
    try {
      await plusUserDrinkSessionCount(userDataID , activeSessionId, drinkId);
      await fetchDataOneDrink(drinkId);
    } catch (e) {
      alert(e);
    }
    finally{
      setIsLoading(false);
    }
  };

  //handles after - button is pressed
  const handleMinusCount = async (userDataID: any, activeSessionId: any, drinkId: any) => {
    setIsLoading(true);
    try {
      await minusUserDrinkSessionCount(userDataID, activeSessionId, drinkId);
      await fetchData();
    } catch (e) {
      alert(e);
    }
    finally{
      setIsLoading(false);
    }
  };

  //redirect to add drink after button pressed
  const goToAddDrink = async () => {
    setIsGoToAddDrink(true);

    try {
        router.push('/drinks/addDrink');
    } catch (e) {
        alert(e);
    }
    finally {
        setIsGoToAddDrink(false);
    }
  }

  //search function
  const Search = () => {
    fetchData(searchText);
  };
  
  return (
    <SafeAreaView className="bg-mainBackground h-full">
      <TopBar/>

      <View className="h-full px-4 flex-1">
        <View className="mt-3 flex-row items-center">
          <View className="flex-1 mr-2">
              <SearchInput searchText={searchText} setSearchText={setSearchText} title="Find your drink..." onSearch={Search}/>
          </View>
          <TouchableOpacity onPress={goToAddDrink}>
              <View className='h-12 pl-3 px-4 mb-4 justify-center items-center rounded-lg bg-buttonBlue'>
                  <Text className='text-2xl mt-1 ml-1'>Add drink</Text>
              </View>
          </TouchableOpacity>
        </View>

        {isLoading && (<ActivityIndicator size="large" color="#ffffff"/>)}

        <ScrollView className="mt-2">
          {userDrinks && userDrinks.length > 0 ? (
            userDrinks.map((drink) => (
              <DrinkTab
                key={drink.drink.$id}
                title={drink.drink.name} 
                amount={drink.quantity.toString()} 
                plusCount={() => handlePlusCount(userData.$id, activeSession.$id, drink.drink.$id)}
                minusCount={() => handleMinusCount(userData.$id, activeSession.$id, drink.drink.$id)}
              />
            ))
            ) : (
              <View className="flex items-center justify-center mt-4">
                <Text className="text-gray-500">No drinks added yet.</Text>
                <Text className="text-gray-500">Add drinks at the top right corner!</Text>
              </View>
            )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default Drinks