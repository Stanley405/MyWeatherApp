import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

export default function UnitToggle() {
  const { unit, toggleUnit } = useSettings();

  return (
    <Pressable onPress={toggleUnit} style={styles.toggle}>
      <Text style={styles.text}>
        {unit === 'metric' ? '°C' : '°F'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F0FE',
    borderRadius: 16,
    marginRight: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A90D9',
  },
});
