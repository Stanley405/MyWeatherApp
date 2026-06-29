import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SavedCitiesContext = createContext();

export function SavedCitiesProvider({ children }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('savedCities').then(val => {
      if (val) setCities(JSON.parse(val));
    });
  }, []);

  function persist(newCities) {
    setCities(newCities);
    AsyncStorage.setItem('savedCities', JSON.stringify(newCities));
  }

  function addCity(city) {
    const id = `${city.lat},${city.lon}`;
    if (cities.some(c => `${c.lat},${c.lon}` === id)) return;
    persist([...cities, city]);
  }

  function removeCity(lat, lon) {
    persist(cities.filter(c => !(c.lat === lat && c.lon === lon)));
  }

  function isSaved(lat, lon) {
    return cities.some(c => c.lat === lat && c.lon === lon);
  }

  return (
    <SavedCitiesContext.Provider value={{ cities, addCity, removeCity, isSaved }}>
      {children}
    </SavedCitiesContext.Provider>
  );
}

export function useSavedCities() {
  return useContext(SavedCitiesContext);
}
