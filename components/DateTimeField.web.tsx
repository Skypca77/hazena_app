import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { DateTimeFieldProps } from './DateTimeField';

const pad = (n: number) => n.toString().padStart(2, '0');

// "YYYY-MM-DD HH:MM" in local time
const format = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;

const parse = (text: string) => {
  const match = text.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/);
  if (!match) return null;
  const [, y, m, d, h = '0', min = '0'] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min));
  return isNaN(date.getTime()) ? null : date;
};

// Native date pickers do not exist on web, so a plain text field is used instead.
const DateTimeField = ({ value, onChange }: DateTimeFieldProps) => {
  const [text, setText] = useState(format(value));
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    setText(format(value));
  }, [value]);

  const handleBlur = () => {
    const date = parse(text);
    if (date) {
      setIsInvalid(false);
      onChange(date);
    } else {
      setIsInvalid(true);
      setText(format(value));
    }
  };

  return (
    <View className="mb-4">
      <TextInput
        value={text}
        onChangeText={setText}
        onBlur={handleBlur}
        placeholder="YYYY-MM-DD HH:MM"
        className="border border-gray-300 rounded-lg p-3 text-lg"
      />
      {isInvalid && <Text className="text-red-500 mt-1">Use format YYYY-MM-DD HH:MM</Text>}
    </View>
  );
};

export default DateTimeField;
