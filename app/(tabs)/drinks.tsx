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
import { getActiveSession, getCurrentUser, getAndAssignAllDrinks, getUserSessionOneDrink, minusUserDrinkSessionCount, plusUserDrinkSessionCount, updateUserSessionStats } from '@aw/index';
import TopBar from '@/components/TopBar';
import { router, useFocusEffect } from 'expo-router';

const Drinks = () => {
  const [userData, setUserData] = useState<any | null>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [userDrinks, setUserDrinks] = useState<any []| null>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

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
        const userDrinks = await getAndAssignAllDrinks(query);
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

  //search function
  const Search = () => {
    fetchData(searchText);
  };
  
  return (
    <SafeAreaView className="bg-mainBackground h-full">
      <TopBar/>

      <View className="h-full px-4 flex-1">
        {isLoading && (<ActivityIndicator size="large" color="#ffffff"/>)}

        <ScrollView className="mt-2">
          {(userDrinks ?? []).map((drink, idx) => {
            // Bezpečnostní kontrola, že drink i drink.drink existuje
            if (!drink || !drink.drink) return null;
            return (
              <DrinkTab
                key={drink.drink.$id ?? idx}
                title={drink.drink.name ?? 'Neznámý drink'}
                amount={drink.quantity?.toString() ?? '0'}
                plusCount={() =>
                  userData && activeSession
                    ? handlePlusCount(userData.$id, activeSession.$id, drink.drink.$id)
                    : null
                }
                minusCount={() =>
                  userData && activeSession
                    ? handleMinusCount(userData.$id, activeSession.$id, drink.drink.$id)
                    : null
                }
              />
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default Drinks