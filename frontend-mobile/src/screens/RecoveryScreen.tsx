import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

export default function RecoveryScreen() {
  const navigation = useNavigation();
  const [lostWallet, setLostWallet] = useState('');
  const [newWallet, setNewWallet] = useState('');
  const [guardian1, setGuardian1] = useState('');
  const [guardian2, setGuardian2] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValid = lostWallet.startsWith('0x') && newWallet.startsWith('0x') && guardian1.startsWith('0x');

  const handleSubmit = () => {
    if (!isValid) {
      Alert.alert("Incomplete", "Please fill in all required wallet addresses.");
      return;
    }
    // Simulation for hackathon
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ClayCard style={styles.mainCard}>
          <View style={styles.successContainer}>
            <Text style={styles.successEmoji}>📨</Text>
            <Text style={styles.successTitle}>Recovery Request Submitted!</Text>
            <Text style={styles.successSubtext}>
              Your guardians have been notified. Once 2 of 3 approve on the Guardian Console, your wallet will be migrated to the new address.
            </Text>
            <ClayButton 
              title="Back to Landing" 
              variant="primary" 
              onPress={() => navigation.navigate('Landing' as never)} 
            />
          </View>
        </ClayCard>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <ClayCard style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recover Wallet</Text>
          <View style={{ width: 24 }} />
        </View>
      </ClayCard>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ClayCard style={styles.mainCard}>
          <Text style={styles.description}>
            Enter the details below to initiate a wallet recovery. 2-of-3 Guardian approval is required.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Lost Wallet Address</Text>
            <TextInput
              style={styles.clayInput}
              placeholder="0x... (Lost Address)"
              value={lostWallet}
              onChangeText={setLostWallet}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Wallet Address</Text>
            <TextInput
              style={styles.clayInput}
              placeholder="0x... (New Address)"
              value={newWallet}
              onChangeText={setNewWallet}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Guardian 1 Address</Text>
            <TextInput
              style={styles.clayInput}
              placeholder="0x... (Guardian 1)"
              value={guardian1}
              onChangeText={setGuardian1}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Guardian 2 Address</Text>
            <TextInput
              style={styles.clayInput}
              placeholder="0x... (Guardian 2)"
              value={guardian2}
              onChangeText={setGuardian2}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ⚠️ Guardians will receive a notification to approve your recovery request.
            </Text>
          </View>

          <ClayButton 
            title="Submit Request" 
            variant="primary" 
            onPress={handleSubmit}
            style={{ marginTop: 20 }}
          />
        </ClayCard>
      </ScrollView>
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
  mainCard: {
    padding: 24,
    minHeight: 400,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
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
    fontSize: 14,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  infoBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtext: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});
