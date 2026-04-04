import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

export default function SignInScreen() {
  const navigation = useNavigation();
  const [pin, setPin] = useState('');

  const handleSignIn = () => {
    // In real app, verify mPIN
    navigation.navigate('Dashboard' as never);
  };

  const handleBiometric = () => {
    // In real app, use biometric authentication
    // For now, just show alert without navigation
    alert('Biometric authentication would be triggered here');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Decorative Elements */}
      <View style={styles.decorativeTop} />
      <View style={styles.decorativeBottom} />
      
      {/* Header */}
      <ClayCard style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign In</Text>
          <View />
        </View>
      </ClayCard>

      {/* Main Content */}
      <View style={styles.centerContent}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your mPIN to continue</Text>
        </View>

        <ClayCard style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>mPIN</Text>
            <TextInput
              style={styles.clayInput}
              placeholder="Enter 6-digit mPIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
            />
          </View>

          <ClayButton 
            title="Sign In"
            variant="primary"
            onPress={handleSignIn}
            style={styles.signInButton}
          />

          <ClayButton 
            title="🔒 Use Biometric"
            variant="secondary"
            onPress={handleBiometric}
            style={styles.biometricButton}
          />

          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text 
                style={styles.footerLink}
                onPress={() => navigation.navigate('Register' as never)}
              >
                Register
              </Text>
            </Text>
          </View>
        </ClayCard>
      </View>
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
  decorativeTop: {
    position: 'absolute',
    top: 80,
    right: 80,
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 40,
  },
  decorativeBottom: {
    position: 'absolute',
    bottom: 80,
    left: 80,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 50,
  },
  header: {
    marginBottom: 32,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 24,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  clayInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  signInButton: {
    marginHorizontal: 0,
    marginBottom: 16,
  },
  biometricButton: {
    marginHorizontal: 0,
    marginBottom: 24,
  },
  footerSection: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  footerLink: {
    color: '#1f2937',
    fontWeight: '600',
  },
});