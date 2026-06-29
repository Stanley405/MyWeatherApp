import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import { API_KEY, BASE_URL, FORECAST_URL } from '../constants/config';
import { useSettings } from '../contexts/SettingsContext';
import { useSavedCities } from '../contexts/SavedCitiesContext';
import { convertTemp, tempSymbol, convertSpeed, speedUnit } from '../utils/units';

export default function DetailScreen({ route }) {
  const { lat, lon } = route.params;
  const { unit } = useSettings();
  const { addCity, removeCity, isSaved } = useSavedCities();
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const [curRes, foreRes] = await Promise.all([
          axios.get(BASE_URL, {
            params: { lat, lon, appid: API_KEY, units: 'metric' },
          }),
          axios.get(FORECAST_URL, {
            params: { lat, lon, appid: API_KEY, units: 'metric' },
          }),
        ]);
        setCurrent(curRes.data);
        setForecast(foreRes.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lat, lon]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  if (error || !current || !forecast) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline" size={48} color="#CCC" />
        <Text style={styles.errorText}>Failed to load weather data.</Text>
      </View>
    );
  }

  const saved = isSaved(current.coord.lat, current.coord.lon);

  function handleSaveToggle() {
    if (saved) {
      removeCity(current.coord.lat, current.coord.lon);
    } else {
      addCity({
        name: current.name,
        country: current.sys.country,
        lat: current.coord.lat,
        lon: current.coord.lon,
      });
    }
  }

  const dailyMap = {};
  forecast.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyMap[date]) {
      dailyMap[date] = { temps: [], icons: [], descriptions: [], pops: [] };
    }
    dailyMap[date].temps.push(item.main.temp);
    dailyMap[date].icons.push(item.weather[0].icon);
    dailyMap[date].descriptions.push(item.weather[0].description);
    dailyMap[date].pops.push(item.pop || 0);
  });

  const dailyForecast = Object.entries(dailyMap)
    .slice(0, 5)
    .map(([date, data]) => {
      const high = Math.max(...data.temps);
      const low = Math.min(...data.temps);
      const middleIndex = Math.floor(data.icons.length / 2);
      const icon = data.icons[middleIndex];
      const maxPop = Math.max(...data.pops);
      const dayName = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
      });
      return { date, dayName, high, low, icon, pop: maxPop };
    });

  const hourlyForecast = forecast.list.slice(0, 8).map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    }),
    temp: item.main.temp,
    icon: item.weather[0].icon,
    pop: item.pop || 0,
  }));

  const sunrise = new Date(current.sys.sunrise * 1000).toLocaleTimeString(
    'en-US',
    { hour: 'numeric', minute: '2-digit', hour12: true }
  );
  const sunset = new Date(current.sys.sunset * 1000).toLocaleTimeString(
    'en-US',
    { hour: 'numeric', minute: '2-digit', hour12: true }
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.cityName}>
            {current.name}, {current.sys.country}
          </Text>
          <Pressable onPress={handleSaveToggle} hitSlop={8}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={26}
              color={saved ? '#4A90D9' : '#999'}
            />
          </Pressable>
        </View>
        <Text style={styles.bigTemp}>
          {convertTemp(current.main.temp, unit)}{tempSymbol(unit)}
        </Text>
        <View style={styles.conditionRow}>
          <Image
            source={{
              uri: `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
            }}
            style={styles.iconLarge}
          />
          <Text style={styles.description}>
            {current.weather[0].description}
          </Text>
        </View>
        <Text style={styles.feelsLike}>
          Feels like {convertTemp(current.main.feels_like, unit)}
          {tempSymbol(unit)}
        </Text>
        <Text style={styles.highLow}>
          H: {convertTemp(current.main.temp_max, unit)}° · L:{' '}
          {convertTemp(current.main.temp_min, unit)}°
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hourly Forecast</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hourlyScroll}
        >
          {hourlyForecast.map((h, i) => (
            <View key={i} style={styles.hourlyItem}>
              <Text style={styles.hourlyTime}>{i === 0 ? 'Now' : h.time}</Text>
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${h.icon}.png`,
                }}
                style={styles.hourlyIcon}
              />
              <Text style={styles.hourlyTemp}>
                {convertTemp(h.temp, unit)}°
              </Text>
              {h.pop > 0.1 && (
                <Text style={styles.hourlyPop}>
                  {Math.round(h.pop * 100)}%
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5-Day Forecast</Text>
        {dailyForecast.map((day, i) => (
          <View
            key={day.date}
            style={[
              styles.dailyRow,
              i < dailyForecast.length - 1 && styles.dailyBorder,
            ]}
          >
            <Text style={styles.dayName}>
              {i === 0 ? 'Today' : day.dayName}
            </Text>
            <View style={styles.dailyIconWrap}>
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${day.icon}.png`,
                }}
                style={styles.dailyIcon}
              />
              {day.pop > 0.2 && (
                <Text style={styles.dailyPop}>
                  {Math.round(day.pop * 100)}%
                </Text>
              )}
            </View>
            <Text style={styles.dailyLow}>
              {convertTemp(day.low, unit)}°
            </Text>
            <View style={styles.tempBar} />
            <Text style={styles.dailyHigh}>
              {convertTemp(day.high, unit)}°
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailsGrid}>
          <DetailItem
            icon="water"
            label="Humidity"
            value={`${current.main.humidity}%`}
          />
          <DetailItem
            icon="speedometer"
            label="Wind"
            value={`${convertSpeed(current.wind.speed, unit)} ${speedUnit(unit)}`}
          />
          <DetailItem
            icon="thermometer"
            label="Pressure"
            value={`${current.main.pressure} hPa`}
          />
          <DetailItem
            icon="eye"
            label="Visibility"
            value={`${(current.visibility / 1000).toFixed(1)} km`}
          />
          <DetailItem icon="sunny" label="Sunrise" value={sunrise} />
          <DetailItem icon="moon" label="Sunset" value={sunset} />
        </View>
      </View>
    </ScrollView>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <View style={styles.detailItem}>
      <Ionicons name={icon} size={20} color="#6A8CAA" />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  errorText: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cityName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A2B3C',
  },
  bigTemp: {
    fontSize: 64,
    fontWeight: '200',
    color: '#1A2B3C',
    marginTop: 4,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLarge: {
    width: 50,
    height: 50,
  },
  description: {
    fontSize: 18,
    color: '#4A6B8A',
    textTransform: 'capitalize',
  },
  feelsLike: {
    fontSize: 15,
    color: '#6A8CAA',
    marginTop: 4,
  },
  highLow: {
    fontSize: 15,
    color: '#6A8CAA',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6A8CAA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  hourlyScroll: {
    marginHorizontal: -4,
  },
  hourlyItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    minWidth: 60,
  },
  hourlyTime: {
    fontSize: 13,
    color: '#6A8CAA',
    fontWeight: '500',
  },
  hourlyIcon: {
    width: 36,
    height: 36,
    marginVertical: 4,
  },
  hourlyTemp: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2B3C',
  },
  hourlyPop: {
    fontSize: 11,
    color: '#5B9BD5',
    marginTop: 2,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dailyBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EEF3',
  },
  dayName: {
    width: 50,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A2B3C',
  },
  dailyIconWrap: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyIcon: {
    width: 32,
    height: 32,
  },
  dailyPop: {
    fontSize: 11,
    color: '#5B9BD5',
  },
  tempBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E8F0FE',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  dailyLow: {
    width: 35,
    fontSize: 15,
    color: '#8899AA',
    textAlign: 'right',
  },
  dailyHigh: {
    width: 35,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2B3C',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#8899AA',
    marginTop: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A2B3C',
    marginTop: 2,
  },
});
