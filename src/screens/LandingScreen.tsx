// Landing Screen - Mobile version of web landing page
import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

export default function LandingScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-200">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-6 py-4 mt-12">
        <ClayCard className="px-6 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-800">LoanPouch</Text>
            <View className="p-2">
              <View className="w-6 h-6 bg-gray-600 rounded-full" />
            </View>
          </View>
        </ClayCard>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 pb-6">
        <ClayCard className="flex-1 p-8 items-center justify-center">
          
          {/* Character Image */}
          <View className="mb-8">
            <View className="w-64 h-64 bg-gray-300 rounded-3xl items-center justify-center">
              <Text className="text-gray-600 text-center">Character Image\n(Add your image here)</Text>
            </View>
            
            {/* Decorative dots */}
            <View className="absolute -top-6 -right-6 w-4 h-4 bg-gray-800 rounded-full" />
            <View className="absolute top-12 -right-8 w-5 h-5 bg-gray-800 rounded-full" />
            <View className="absolute -bottom-6 right-16 w-4 h-4 bg-gray-800 rounded-full" />
          </View>

          {/* Title */}
          <View className="mb-6">
            <Text className="text-5xl font-bold text-gray-800 text-center leading-tight">
              Ready When{'\n'}You Are
            </Text>
          </View>
          
          {/* Description */}
          <Text className="text-lg text-gray-600 text-center mb-8 px-4">
            Get immediate, high-quality support and attention with just one touch. 
            Your lending solution for the future.
          </Text>
          
          {/* Action Buttons */}
          <View className="w-full space-y-4">
            <ClayButton 
              title="Get Started" 
              variant="primary"
              onPress={() => console.log('Get Started pressed')}
            />
            <ClayButton 
              title="Sign In" 
              variant="primary"
              onPress={() => console.log('Sign In pressed')}
            />
          </View>

        </ClayCard>
      </View>
    </ScrollView>
  );
}