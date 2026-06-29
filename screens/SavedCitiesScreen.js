import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { API_KEY, BASE_URL } from '../constants/config';
import { useSavedCities } from '../contexts/SavedCitiesContext';
import { useSettings } from '../contexts/SettingsContext';
import { convertTemp, tempSymbol } from '../utils/units';

export default function SavedCitiesScreen({ navigation }) {
  const { cities, removeCity } = useSavedCities();
  const { unit } = useSettings();
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAllWeather = useCallback(async () => {
    if (cities.length === 0) {
      setWeatherData({});
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(
        cities.map(city =>
          axios
            .get(BASE_URL, {
              params: { lat: city.lat, lon: city.lon, appid: API_KEY, units: 'metric' },
            })
            .then(res => ({ key: `${city.lat},${city.lon}`, data: res.data }))
            .catch(() => ({ key: `${city.lat},${city.lon}`, data: null }))
        )
      );
      const map = {};
      results.forEach(r => {
        map[r.key] = r.data;
      });
      setWeatherData(map);
    } finally {
      setLoading(false);
    }
  }, [cities]);

  useFocusEffect(
    useCallback(() => {
      fetchAllWeather();
    }, [fetchAllWeather])
  );

  if (cities.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="bookmark-outline" size={48} color="#CCC" />
        <Text style={styles.emptyText}>No saved cities yet</Text>
        <Text style={styles.emptyHint}>
          Search for a city and tap the bookmark to save it here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchAllWeather} />
      }
    >
      {cities.map(city => {
        const key = `${city.lat},${city.lon}`;
        const w = weatherData[key];
        return (
          <Pressable
            key={key}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() =>
              navigation.navigate('Detail', {
                lat: city.lat,
                lon: city.lon,
                cityName: city.name,
              })
            }
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cityName}>{city.name}</Text>
              <Text style={styles.cityCountry}>{city.country}</Text>
              {w && (
                <Text style={styles.condition}>{w.weather[0].description}</Text>
              )}
            </View>
            <View style={styles.cardRight}>
              {w ? (
                <Text style={styles.temp}>
                  {convertTemp(w.main.temp, unit)}
                  {tempSymbol(unit)}
                </Text>
              ) : (
                <ActivityIndicator size="small" color="#4A90D9" />
              )}
            </View>
            <Pressable
              onPress={() => removeCity(city.lat, city.lon)}
              style={styles.removeButton}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={22} color="#CC4444" />
            </Pressable>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    backgroundColor: '#F0F4F8',
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '600',
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardLeft: {
    flex: 1,
  },
  cityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A2B3C',
  },
  cityCountry: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  condition: {
    fontSize: 14,
    color: '#6A8CAA',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  cardRight: {
    marginRight: 12,
  },
  temp: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1A2B3C',
  },
  removeButton: {
    padding: 4,
  },
});
