import { AntDesign } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React from 'react';
import { TextInput, View, TouchableOpacity } from 'react-native';

const SearchInput = ({ searchText, setSearchText, title, onSearch }) => {

  return (
    <View className="h-12 pl-3 px-4 mb-4 border items-center border-gray-300 rounded-lg flex-row bg-fields">
      <TextInput
        className="flex-1"
        placeholder={title}
        placeholderTextColor="#aaa"
        value={searchText}
        onChangeText={text => setSearchText(text)}
      />

      <TouchableOpacity onPress={onSearch}>
        <FontAwesome6 name="magnifying-glass" size={24} color="black" />
      </TouchableOpacity>

    </View>
  );
};

export default SearchInput;