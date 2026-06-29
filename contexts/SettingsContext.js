import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [unit, setUnit] = useState('metric');

  useEffect(() => {
    AsyncStorage.getItem('unit').then(val => {
      if (val) setUnit(val);
    });
  }, []);

  function toggleUnit() {
    const next = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(next);
    AsyncStorage.setItem('unit', next);
  }

  return (
    <SettingsContext.Provider value={{ unit, toggleUnit }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
