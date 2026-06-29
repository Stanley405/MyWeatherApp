import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ErrorMessage({ message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderRadius: 14,
    padding: 20,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  text: {
    color: '#856404',
    fontSize: 16,
    textAlign: 'center',
  },
});
