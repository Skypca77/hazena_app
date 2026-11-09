import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// Date + time picker (Android / iOS).
// Uses @react-native-community/datetimepicker, which is part of Expo Go,
// so it works without a custom native build. The web version is in DateTimeField.web.tsx.
export interface DateTimeFieldProps {
  value: Date;
  onChange: (date: Date) => void;
}

const DateTimeField = ({ value, onChange }: DateTimeFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="border border-gray-300 rounded-lg p-3 mb-4"
      >
        <Text className="text-lg">{value.toLocaleString()}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isVisible}
        mode="datetime"
        date={value}
        onConfirm={(date) => {
          setIsVisible(false);
          onChange(date);
        }}
        onCancel={() => setIsVisible(false)}
      />
    </>
  );
};

export default DateTimeField;
