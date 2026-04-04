import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens
import LandingScreen from '../screens/LandingScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SignInScreen from '../screens/SignInScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BorrowScreen from '../screens/BorrowScreen';
import LendScreen from '../screens/LendScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import KYCVerificationScreen from '../screens/KYCVerificationScreen';

const Tab = createBottomTabNavigator();

// Fixed icon component for React Native
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons = {
    Dashboard: '●', // Solid black circle for home/dashboard
    Borrow: '↓', // Down arrow for borrow
    Lend: '↑', // Up arrow for lend  
    Profile: '○', // Hollow circle for profile
  };
  
  return (
    <Text style={{ 
      fontSize: 24,
      opacity: focused ? 1 : 0.6,
      color: focused ? '#1f2937' : '#6b7280'
    }}>
      {icons[name as keyof typeof icons]}
    </Text>
  );
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Landing" // Start with landing page
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name} focused={focused} />
          ),
          tabBarActiveTintColor: '#1f2937',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerShown: false,
        })}
      >
        {/* Main Navigation - Only 4 tabs */}
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ tabBarLabel: 'Home' }} // Shows as "Home" but goes to Dashboard
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
        
        {/* Hidden screens - No tab bar visibility */}
        <Tab.Screen 
          name="Landing" 
          component={LandingScreen}
          options={{ 
            tabBarButton: () => null,
            tabBarStyle: { display: 'none' }
          }}
        />
        <Tab.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ 
            tabBarButton: () => null,
            tabBarStyle: { display: 'none' }
          }}
        />
        <Tab.Screen 
          name="SignIn" 
          component={SignInScreen}
          options={{ 
            tabBarButton: () => null,
            tabBarStyle: { display: 'none' }
          }}
        />
        <Tab.Screen 
          name="KYCVerification" 
          component={KYCVerificationScreen}
          options={{ 
            tabBarButton: () => null,
            tabBarStyle: { display: 'none' }
          }}
        />
        <Tab.Screen 
          name="Analytics" 
          component={AnalyticsScreen}
          options={{ 
            tabBarButton: () => null,
          }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen}
          options={{ 
            tabBarButton: () => null,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}