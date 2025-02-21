import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';

type FormFieldProps = {
    title: string;
    value: string;
    placeholder?: string;
    handleChangeText: (text: string) => void;
    otherStyles?: string;
    [key: string]: any;
  };

const FormField: React.FC<FormFieldProps> = ({ title, value, placeholder, handleChangeText, otherStyles, ...props}) => {
    const [showPswrd, setShowPswrd] = useState(false)

    return (
        <View className={`space-y-2 ${otherStyles}`}>

            <Text className='text-base text-gray-100'>{title}</Text>

            <View className='w-fit h-16 px-4 bg-fields items-center rounded-2xl flex-row'>
                <TextInput
                    className='flex-1 text-black text-base'
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#000"
                    onChangeText={handleChangeText}
                    secureTextEntry={title === 'Password' && !showPswrd}
                />

                {title === 'Password' && (
                    <TouchableOpacity onPress={() => setShowPswrd(!showPswrd)}>
                        <AntDesign name="eye" size={24} color="black"/>
                    </TouchableOpacity>
                )}
            </View>
        </View>
  )
}

export default FormField