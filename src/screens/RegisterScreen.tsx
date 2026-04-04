import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mobile: '',
    otp: '',
    mpin: '',
    tpin: '',
  });

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Complete registration - navigate to dashboard
      navigation.navigate('Dashboard' as never);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Aadhaar Verification</Text>
            <View style={styles.uploadCard}>
              <Text style={styles.uploadText}>📄</Text>
              <Text style={styles.uploadLabel}>Upload Aadhaar Card</Text>
              <Text style={styles.uploadSubtext}>Tap to upload document</Text>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>PAN Verification</Text>
            <View style={styles.uploadCard}>
              <Text style={styles.uploadText}>💳</Text>
              <Text style={styles.uploadLabel}>Upload PAN Card</Text>
              <Text style={styles.uploadSubtext}>Tap to upload document</Text>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Mobile Verification</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.clayInput}
                placeholder="+91 98765 43210"
                value={formData.mobile}
                onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>OTP</Text>
              <TextInput
                style={styles.clayInput}
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChangeText={(text) => setFormData({ ...formData, otp: text })}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Face Verification</Text>
            <View style={styles.faceCapture}>
              <View style={styles.faceCircle}>
                <Text style={styles.faceEmoji}>📷</Text>
              </View>
              <Text style={styles.uploadLabel}>Capture Live Selfie</Text>
              <Text style={styles.uploadSubtext}>Tap to open camera</Text>
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Set Security PINs</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>mPIN (Login)</Text>
              <TextInput
                style={styles.clayInput}
                placeholder="Enter 6-digit mPIN"
                value={formData.mpin}
                onChangeText={(text) => setFormData({ ...formData, mpin: text })}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>tPIN (Transactions)</Text>
              <TextInput
                style={styles.clayInput}
                placeholder="Enter 6-digit tPIN"
                value={formData.tpin}
                onChangeText={(text) => setFormData({ ...formData, tpin: text })}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <ClayCard style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Get Started</Text>
          <View />
        </View>
      </ClayCard>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View key={s} style={styles.progressItem}>
            <View style={[
              styles.progressCircle, 
              s <= step ? styles.progressActive : styles.progressInactive
            ]}>
              <Text style={[
                styles.progressText,
                s <= step ? styles.progressTextActive : styles.progressTextInactive
              ]}>
                {s}
              </Text>
            </View>
            {s < 5 && <View style={[
              styles.progressLine,
              s < step ? styles.progressLineActive : styles.progressLineInactive
            ]} />}
          </View>
        ))}
      </View>

      {/* Main Content */}
      <ClayCard style={styles.mainCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderStep()}
          
          <View style={styles.buttonContainer}>
            <ClayButton 
              title={step === 5 ? "Complete Registration" : "Continue"}
              variant="primary"
              onPress={handleNext}
              style={styles.nextButton}
            />
          </View>
        </ScrollView>
      </ClayCard>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text 
            style={styles.footerLink}
            onPress={() => navigation.navigate('SignIn' as never)}
          >
            Sign In
          </Text>
        </Text>
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
  header: {
    marginBottom: 16,
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressActive: {
    backgroundColor: '#1f2937',
  },
  progressInactive: {
    backgroundColor: '#e5e7eb',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressTextActive: {
    color: 'white',
  },
  progressTextInactive: {
    color: '#6b7280',
  },
  progressLine: {
    width: 24,
    height: 2,
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#1f2937',
  },
  progressLineInactive: {
    backgroundColor: '#e5e7eb',
  },
  mainCard: {
    flex: 1,
    padding: 24,
  },
  stepContent: {
    alignItems: 'center',
    minHeight: 300,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 32,
    textAlign: 'center',
  },
  uploadCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    width: '100%',
  },
  uploadText: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
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
  faceCapture: {
    alignItems: 'center',
    width: '100%',
  },
  faceCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  faceEmoji: {
    fontSize: 40,
  },
  buttonContainer: {
    marginTop: 32,
  },
  nextButton: {
    marginHorizontal: 0,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    color: '#1f2937',
    fontWeight: '600',
  },
});