import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import BorrowScreen from '../screens/BorrowScreen';
import LendScreen from '../screens/LendScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Fixed icon component for React Native
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons = {
    Dashboard: '🏠',
    Borrow: '💰', 
    Lend: '💳',
    Profile: '👤',
  };
  
  return (
    <Text style={{ 
      fontSize: 20,
      opacity: focused ? 1 : 0.6 
    }}>
      {icons[name as keyof typeof icons]}
    </Text>
  );
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name} focused={focused} />
          ),
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerShown: false, // Hide default headers since our screens have custom headers
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen 
          name="Borrow" 
          component={BorrowScreen}
          options={{ tabBarLabel: 'Borrow' }}
        />
        <Tab.Screen 
          name="Lend" 
          component={LendScreen}
          options={{ tabBarLabel: 'Lend' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}