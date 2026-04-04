import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

export default function LandingScreen() {
  const navigation = useNavigation();
  const [floatAnim] = useState(new Animated.Value(0));

  useEffect(() => {
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
    startFloating();
  }, []);

  const floatInterpolate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ClayCard style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>LoanPouch</Text>
          <View style={styles.mailIcon}>
            <Text>✉</Text>
          </View>
        </View>
      </ClayCard>

      <ClayCard style={styles.mainCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.characterSection}>
            <Animated.View style={{ transform: [{ translateY: floatInterpolate }] }}>
              <View style={styles.characterFrame}>
                <Text style={{ fontSize: 80 }}>👤</Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Ready When{'\n'}You Are</Text>
            <Text style={styles.subtitle}>
              Secure your future with decentralized lending. Built with trust and privacy.
            </Text>
          </View>
          
          <View style={styles.buttonSection}>
            <ClayButton 
              title="Create New Wallet" 
              variant="primary" 
              onPress={() => navigation.navigate('Register' as never)} 
            />
            <ClayButton 
              title="Recover Lost Wallet" 
              variant="secondary" 
              style={{ marginTop: 12 }}
              onPress={() => navigation.navigate('Recovery' as never)} 
            />
          </View>
        </ScrollView>
      </ClayCard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    padding: 16,
    paddingTop: 50,
  },
  header: {
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  mailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    flex: 1,
    padding: 24,
  },
  characterSection: {
    alignItems: 'center',
    marginVertical: 32,
  },
  characterFrame: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  buttonSection: {
    marginTop: 8,
  },
});