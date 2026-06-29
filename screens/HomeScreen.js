import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import ErrorMessage from '../components/ErrorMessage';
import { API_KEY, BASE_URL } from '../constants/config';
import { useSavedCities } from '../contexts/SavedCitiesContext';

export default function HomeScreen({ navigation }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addCity, removeCity, isSaved } = useSavedCities();

  async function fetchWeather(params) {
    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const response = await axios.get(BASE_URL, {
        params: { ...params, appid: API_KEY, units: 'metric' },
      });
      setWeather(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('City not found. Try selecting from the dropdown suggestions.');
      } else if (err.response?.status === 401) {
        setError('Invalid API key. Please check your key in constants/config.js.');
      } else if (!err.response) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSaveToggle() {
    if (!weather) return;
    const { coord, name, sys } = weather;
    if (isSaved(coord.lat, coord.lon)) {
      removeCity(coord.lat, coord.lon);
    } else {
      addCity({ name, country: sys.country, lat: coord.lat, lon: coord.lon });
    }
  }

  function handleCardPress() {
    if (!weather) return;
    navigation.navigate('Detail', {
      lat: weather.coord.lat,
      lon: weather.coord.lon,
      cityName: weather.name,
    });
  }

  const saved = weather ? isSaved(weather.coord.lat, weather.coord.lon) : false;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <SearchBar
        onSearch={(cityName) => fetchWeather({ q: cityName })}
        onSelectCity={(lat, lon) => fetchWeather({ lat, lon })}
        loading={loading}
      />

      {loading && (
        <ActivityIndicator size="large" color="#4A90D9" style={styles.loader} />
      )}

      {error && <ErrorMessage message={error} />}

      {weather && (
        <View>
          <View style={styles.actionRow}>
            <Pressable onPress={handleSaveToggle} style={styles.saveButton}>
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={saved ? '#4A90D9' : '#888'}
              />
              <Text style={[styles.saveText, saved && styles.saveTextActive]}>
                {saved ? 'Saved' : 'Save'}
              </Text>
            </Pressable>
          </View>
          <Pressable onPress={handleCardPress}>
            <WeatherCard weather={weather} />
            <Text style={styles.tapHint}>Tap for details</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && !weather && (
        <Text style={styles.hint}>Search for a city to see the current weather.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingTop: 8,
    flexGrow: 1,
    backgroundColor: '#F0F4F8',
  },
  loader: {
    marginTop: 40,
  },
  hint: {
    textAlign: 'center',
    color: '#9AABB8',
    fontSize: 16,
    marginTop: 60,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  saveText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  saveTextActive: {
    color: '#4A90D9',
  },
  tapHint: {
    textAlign: 'center',
    color: '#AABBC8',
    fontSize: 13,
    marginTop: 8,
  },
});
