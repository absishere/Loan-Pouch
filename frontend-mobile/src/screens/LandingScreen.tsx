// Minimalistic Landing Screen - Matches Web Design
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

export default function LandingScreen() {
  const navigation = useNavigation();
  const [floatAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Create floating animation
    const startFloating = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Create rotation animation for dots
    const startRotating = () => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ).start();
    };

    startFloating();
    startRotating();
  }, []);

  const floatInterpolate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleGetStarted = () => {
    // Navigate to Registration screen
    navigation.navigate('Register' as never);
  };

  const handleSignIn = () => {
    // Navigate to Sign In screen
    navigation.navigate('SignIn' as never);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Animated Background Elements */}
      <Animated.View 
        style={[
          styles.backgroundDot1,
          { transform: [{ translateY: floatInterpolate }] }
        ]} 
      />
      <Animated.View 
        style={[
          styles.backgroundDot2,
          { transform: [{ translateY: floatAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 15],
          }) }] }
        ]} 
      />
      
      {/* Header - Minimalistic */}
      <ClayCard style={styles.header} animate={true}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>LoanPouch</Text>
          <View style={styles.mailIcon}>
            <Text style={styles.mailText}>✉</Text>
          </View>
        </View>
      </ClayCard>

      {/* Main Content Card */}
      <ClayCard style={styles.mainCard} animate={true}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Character Area */}
          <View style={styles.characterSection}>
            <Animated.View 
              style={[
                styles.characterContainer,
                { transform: [{ translateY: floatInterpolate }] }
              ]}
            >
              {/* Character Image */}
              <View style={styles.characterFrame}>
                <View style={[styles.characterImage, { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={styles.characterPlaceholder}>👤</Text>
                </View>
              </View>
              
              {/* Floating Dots */}
              <Animated.View 
                style={[
                  styles.dot, 
                  styles.dot1,
                  { transform: [{ rotate: rotateInterpolate }] }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.dot, 
                  styles.dot2,
                  { transform: [{ rotate: rotateInterpolate }] }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.dot, 
                  styles.dot3,
                  { transform: [{ rotate: rotateInterpolate }] }
                ]} 
              />
            </Animated.View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Ready When{'\n'}You Are</Text>
            <Text style={styles.subtitle}>
              Get immediate, high-quality support and attention with just one touch. 
              Your lending solution for the future.
            </Text>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <ClayButton 
              title="Get Started" 
              variant="primary"
              style={styles.actionButton}
              onPress={handleGetStarted}
            />
            <ClayButton 
              title="Sign In" 
              variant="primary"
              style={styles.actionButton}
              onPress={handleSignIn}
            />
          </View>

        </ScrollView>
      </ClayCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e7eb', // Light gray background like web
    padding: 16,
    paddingTop: 50,
    position: 'relative',
  },
  backgroundDot1: {
    position: 'absolute',
    top: 100,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  backgroundDot2: {
    position: 'absolute',
    bottom: 150,
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  header: {
    marginBottom: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32, // Increased from 24
    fontWeight: 'bold',
    color: '#1f2937',
  },
  mailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mailText: {
    fontSize: 16,
  },
  mainCard: {
    flex: 1,
    padding: 32,
  },
  characterSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  characterContainer: {
    position: 'relative',
  },
  characterFrame: {
    width: 200,
    height: 200,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  characterImage: {
    width: 200,
    height: 200,
    borderRadius: 24,
  },
  characterPlaceholder: {
    fontSize: 80,
    opacity: 0.7,
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1f2937',
  },
  dot1: {
    top: -10,
    right: -10,
  },
  dot2: {
    top: 40,
    right: -20,
  },
  dot3: {
    bottom: -10,
    right: 60,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 56,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonSection: {
    gap: 16,
  },
  actionButton: {
    // Remove margins since Animated.View handles spacing
  },
});