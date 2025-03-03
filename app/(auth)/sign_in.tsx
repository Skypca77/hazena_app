/****************************/
/*  Name: Miroslav Zárecký  */
/*  Login: xzarec02         */
/*  Date: 12.14.2024        */
/****************************/

import { View, Text, ScrollView, Image, Alert  } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import { useState } from 'react'
import CustomButton from '@/components/CustomButton'
import { Link, router } from 'expo-router'
import { sign_in } from '@aw/index'

const SignIn = () => {
  const [form, setForm] = useState({
    emailOrName: '',
    password: ''
  })

  const [isSubmit, setIsSubmit] = useState(false)

  const submit = async () => {
    if(form.emailOrName === "" || form.password === "") {
      Alert.alert('Error', 'Fill all the fields')
      return;
    }

    setIsSubmit(true);

  try {
    // Check if the input is an email or a name
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailOrName);
    await sign_in(isEmail ? form.emailOrName : '', form.password);
    router.replace('/session');
    }
    finally {
      setIsSubmit(false);
    }
  }


  return (
    <SafeAreaView className="bg-mainBackground h-full">
      <ScrollView>
        <View className='w-full min-h-[90vh] justify-center px-4 my-6'>
          <View className="items-center justify-center mt-5">
            <Image source={require('@/assets/images/VUTHazena.png')} style={{ width: 200, height: 200 }}/>
          </View>
          <Text className="text-3xl font-semibold mt-10">Log-in to Handball app</Text>
  
          <FormField
            title="Email or Name"
            value={form.emailOrName}
            handleChangeText={(e) => setForm({...form, emailOrName: e})}
            otherStyles="mt-5"
            keyBoardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({...form, password: e})}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="bg-green-300 mt-7"
            isLoading={isSubmit}
            textStyles=""
          />

          <View className='justify-center flex-row pt-5'>
            <Link href="/sign_up" className='text-lg'>Create an account</Link>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn