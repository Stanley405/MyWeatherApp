import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './screens/HomeScreen';
import SavedCitiesScreen from './screens/SavedCitiesScreen';
import DetailScreen from './screens/DetailScreen';
import UnitToggle from './components/UnitToggle';
import { SettingsProvider } from './contexts/SettingsContext';
import { SavedCitiesProvider } from './contexts/SavedCitiesContext';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const SavedStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#F0F4F8' },
  headerShadowVisible: false,
  headerTintColor: '#1A2B3C',
  headerTitleStyle: { fontWeight: '600' },
  contentStyle: { backgroundColor: '#F0F4F8' },
  headerRight: () => <UnitToggle />,
};

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Weather' }}
      />
      <HomeStack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: 'Details' }}
      />
    </HomeStack.Navigator>
  );
}

function SavedStackScreen() {
  return (
    <SavedStack.Navigator screenOptions={screenOptions}>
      <SavedStack.Screen
        name="SavedMain"
        component={SavedCitiesScreen}
        options={{ title: 'Saved Cities' }}
      />
      <SavedStack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: 'Details' }}
      />
    </SavedStack.Navigator>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <SavedCitiesProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => {
                const iconName =
                  route.name === 'Home'
                    ? focused ? 'search' : 'search-outline'
                    : focused ? 'bookmark' : 'bookmark-outline';
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#4A90D9',
              tabBarInactiveTintColor: '#999',
              tabBarStyle: { backgroundColor: '#F8FAFC', borderTopColor: '#E8EEF3' },
            })}
          >
            <Tab.Screen name="Home" component={HomeStackScreen} />
            <Tab.Screen name="Saved" component={SavedStackScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SavedCitiesProvider>
    </SettingsProvider>
  );
}
