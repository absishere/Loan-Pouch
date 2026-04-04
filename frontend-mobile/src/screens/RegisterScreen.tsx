import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
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

  // State to track step completion
  const [aadhaarDone, setAadhaarDone] = useState(false);
  const [panDone, setPanDone] = useState(false);
  const [mobileDone, setMobileDone] = useState(false);
  const [faceDone, setFaceDone] = useState(false);

  const canContinue = () => {
    if (step === 1) return aadhaarDone;
    if (step === 2) return panDone;
    if (step === 3) return mobileDone;
    if (step === 4) return faceDone;
    if (step === 5) return formData.mpin.length === 6 && formData.tpin.length === 6;
    return false;
  };

  const handleNext = () => {
    if (!canContinue()) {
      let message = "Please complete the requirement to continue.";
      if (step === 1) message = "Please upload your Aadhaar Card.";
      if (step === 2) message = "Please upload your PAN Card.";
      if (step === 3) message = "Please enter and verify your OTP.";
      if (step === 4) message = "Please capture your live selfie.";
      if (step === 5) message = "Please set both 6-digit security PINs.";
      Alert.alert("Incomplete", message);
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      // Complete registration
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
            <TouchableOpacity 
              style={[styles.uploadCard, aadhaarDone && styles.uploadDone]} 
              onPress={() => setAadhaarDone(true)}
            >
              <Text style={styles.uploadText}>{aadhaarDone ? '✅' : '📄'}</Text>
              <Text style={styles.uploadLabel}>{aadhaarDone ? 'Aadhaar Uploaded' : 'Upload Aadhaar Card'}</Text>
              <Text style={styles.uploadSubtext}>Tap to simulate upload</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>PAN Verification</Text>
            <TouchableOpacity 
              style={[styles.uploadCard, panDone && styles.uploadDone]} 
              onPress={() => setPanDone(true)}
            >
              <Text style={styles.uploadText}>{panDone ? '✅' : '💳'}</Text>
              <Text style={styles.uploadLabel}>{panDone ? 'PAN Uploaded' : 'Upload PAN Card'}</Text>
              <Text style={styles.uploadSubtext}>Tap to simulate upload</Text>
            </TouchableOpacity>
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
              <Text style={styles.inputLabel}>OTP (Demo: 123456)</Text>
              <TextInput
                style={styles.clayInput}
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChangeText={(text) => {
                  setFormData({ ...formData, otp: text });
                  if (text === '123456') setMobileDone(true);
                }}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            {mobileDone && <Text style={styles.successText}>✅ Mobile Verified</Text>}
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Face Verification</Text>
            <TouchableOpacity 
              style={[styles.faceCapture, faceDone && styles.uploadDone]} 
              onPress={() => setFaceDone(true)}
            >
              <View style={[styles.faceCircle, faceDone && styles.faceActive]}>
                <Text style={styles.faceEmoji}>{faceDone ? '✅' : '📷'}</Text>
              </View>
              <Text style={styles.uploadLabel}>{faceDone ? 'Face Verified' : 'Capture Live Selfie'}</Text>
              <Text style={styles.uploadSubtext}>Tap to simulate scan</Text>
            </TouchableOpacity>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Set Security PINs</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>mPIN (Login - 6 digits)</Text>
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
              <Text style={styles.inputLabel}>tPIN (Transactions - 6 digits)</Text>
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
      
      <ClayCard style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Get Started</Text>
          <View />
        </View>
      </ClayCard>

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

      <ClayCard style={styles.mainCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderStep()}
          
          <View style={styles.buttonContainer}>
            <ClayButton 
              title={step === 5 ? "Generate Biometric Wallet" : "Continue"}
              variant="primary"
              onPress={handleNext}
              style={{ marginHorizontal: 0, opacity: canContinue() ? 1 : 0.6 }}
            />
          </View>
        </ScrollView>
      </ClayCard>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Lost your wallet?{' '}
          <Text 
            style={styles.footerLink}
            onPress={() => navigation.navigate('Recovery' as never)}
          >
            Recover via Guardians
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
    backgroundColor: '#cbd5e1',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressTextActive: {
    color: 'white',
  },
  progressTextInactive: {
    color: '#64748b',
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
    backgroundColor: '#cbd5e1',
  },
  mainCard: {
    flex: 1,
    padding: 24,
  },
  stepContent: {
    alignItems: 'center',
    minHeight: 280,
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
  uploadDone: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
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
    borderWidth: 1,
    borderColor: '#d1d5db',
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
  faceActive: {
    borderColor: '#10b981',
  },
  faceEmoji: {
    fontSize: 40,
  },
  buttonContainer: {
    marginTop: 32,
  },
  footer: {
    paddingVertical: 20,
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
  successText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 16,
  },
});