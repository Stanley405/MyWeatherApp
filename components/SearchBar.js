import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import axios from 'axios';
const PHOTON_URL = 'https://photon.komoot.io/api/';

export default function SearchBar({ onSearch, onSelectCity, loading }) {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(PHOTON_URL, {
          params: { q: text, limit: 5, layer: 'city' },
        });
        const cities = res.data.features.map(f => ({
          name: f.properties.name,
          state: f.properties.state,
          country: f.properties.country,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
        }));
        setSuggestions(cities);
      } catch {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [text]);

  function handleSelect(city) {
    const label = [city.name, city.state, city.country].filter(Boolean).join(', ');
    setText(label);
    setSuggestions([]);
    onSelectCity(city.lat, city.lon);
  }

  function handleSearch() {
    if (text.trim()) {
      setSuggestions([]);
      onSearch(text.trim());
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Enter city name..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? '...' : 'Search'}</Text>
        </Pressable>
      </View>

      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((city, index) => (
            <Pressable
              key={`${city.lat}-${city.lon}`}
              style={({ pressed }) => [
                styles.suggestion,
                index < suggestions.length - 1 && styles.suggestionBorder,
                pressed && styles.suggestionPressed,
              ]}
              onPress={() => handleSelect(city)}
            >
              <Text style={styles.cityName}>{city.name}</Text>
              <Text style={styles.cityMeta}>
                {[city.state, city.country].filter(Boolean).join(', ')}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  suggestion: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionPressed: {
    backgroundColor: '#F5F8FF',
  },
  cityName: {
    fontSize: 15,
    color: '#1A2B3C',
    fontWeight: '500',
  },
  cityMeta: {
    fontSize: 13,
    color: '#888',
    marginTop: 1,
  },
});
