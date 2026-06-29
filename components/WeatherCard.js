import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { convertTemp, tempSymbol, convertSpeed, speedUnit } from '../utils/units';

function getBackgroundColor(condition) {
  const c = condition.toLowerCase();
  if (c.includes('clear') || c.includes('sunny')) return '#4A90D9';
  if (c.includes('cloud')) return '#7B8FA1';
  if (c.includes('rain') || c.includes('drizzle')) return '#5B6E80';
  if (c.includes('snow')) return '#A8C4D8';
  if (c.includes('thunder') || c.includes('storm')) return '#4A4E69';
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return '#8D99AE';
  return '#6B9DC2';
}

export default function WeatherCard({ weather }) {
  const { unit } = useSettings();
  const { name, sys, main, weather: conditions, wind } = weather;
  const condition = conditions[0];
  const iconUrl = `https://openweathermap.org/img/wn/${condition.icon}@2x.png`;
  const bgColor = getBackgroundColor(condition.description);

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <Text style={styles.location}>
        {name}, {sys.country}
      </Text>

      <View style={styles.mainRow}>
        <Image source={{ uri: iconUrl }} style={styles.icon} />
        <Text style={styles.temp}>
          {convertTemp(main.temp, unit)}{tempSymbol(unit)}
        </Text>
      </View>

      <Text style={styles.description}>
        {condition.description.charAt(0).toUpperCase() + condition.description.slice(1)}
      </Text>

      <Text style={styles.feelsLike}>
        Feels like {convertTemp(main.feels_like, unit)}{tempSymbol(unit)}
      </Text>

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Humidity</Text>
          <Text style={styles.detailValue}>{main.humidity}%</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Wind</Text>
          <Text style={styles.detailValue}>
            {convertSpeed(wind.speed, unit)} {speedUnit(unit)}
          </Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>High / Low</Text>
          <Text style={styles.detailValue}>
            {convertTemp(main.temp_max, unit)}° / {convertTemp(main.temp_min, unit)}°
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  location: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  icon: {
    width: 80,
    height: 80,
  },
  temp: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '200',
    lineHeight: 80,
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    marginBottom: 4,
  },
  feelsLike: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginBottom: 24,
  },
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    width: '100%',
  },
  detail: {
    flex: 1,
    alignItems: 'center',
  },
  detailDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
