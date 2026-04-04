import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import { api } from '../services/api';
import * as LocalAuthentication from 'expo-local-authentication';

export default function BorrowScreen() {
  const [amount, setAmount] = useState('5000');
  const [duration, setDuration] = useState('7');
  const [purpose, setPurpose] = useState('personal');
  const [borrowerAddress, setBorrowerAddress] = useState('');
  const [guardian1, setGuardian1] = useState('');
  const [guardian2, setGuardian2] = useState('');
  const [guardian3, setGuardian3] = useState('');
  const [loading, setLoading] = useState(false);
  const [riskInfo, setRiskInfo] = useState<{ risk_label: string; risk_probability: number } | null>(null);

  const durationOptions = [
    { value: '7', label: '7 days' },
    { value: '15', label: '15 days' },
    { value: '30', label: '30 days' },
  ];

  const purposeOptions = [
    { value: 'medical', label: '🏥 Medical', icon: '🏥' },
    { value: 'education', label: '📚 Education', icon: '📚' },
    { value: 'emergency', label: '🚨 Emergency', icon: '🚨' },
    { value: 'personal', label: '💼 Personal', icon: '💼' },
  ];

  const amountWei = Math.floor(Number(amount) * 1e18);
  const interestRate = 0.05; // 5% APR
  const interestWei = Math.floor(amountWei * interestRate * (Number(duration) / 365));
  const totalRepayment = Number(amount) + interestWei / 1e18;

  const checkRisk = async () => {
    if (Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    try {
      const res = await api.getRiskScore(450, Number(amount), Number(duration));
      setRiskInfo(res);
    } catch {
      Alert.alert('Error', 'Could not fetch AI risk score. Is backend running?');
    }
  };

  const handleSubmit = async () => {
    if (!borrowerAddress || !guardian1 || !guardian2 || !guardian3) {
      Alert.alert('Missing Fields', 'Please fill in your wallet address and all 3 guardians.');
      return;
    }
    if (Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid loan amount.');
      return;
    }

    try {
      // 1. TEE Biometric Gate
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert("Security Error", "Biometric authentication (FaceID/Fingerprint) is required to sign transactions.");
        return;
      }

      // 2. Prompt Secure Enclave
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to sign loan request on-chain',
        fallbackLabel: 'Use Device PIN',
      });

      if (!authResult.success) {
        Alert.alert("Authentication Failed", "You cannot proceed without biometric approval.");
        return;
      }

      setLoading(true);
      const res = await api.requestLoan({
        borrower_address: borrowerAddress,
        amount: amountWei,
        interest_amount: interestWei,
        guardians: [guardian1, guardian2, guardian3],
        funding_deadline_days: Number(duration),
      });
      Alert.alert('✅ Loan Requested!', `Transaction: ${res.tx_hash}`);
    } catch (e: any) {
      Alert.alert('❌ Failed', e?.message ?? 'Loan request failed. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Request Loan</Text>
        <Text style={styles.headerSubtitle}>Secured by blockchain · B-INR powered</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Wallet Address */}
        <ClayCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your Wallet Address</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="0x..."
            value={borrowerAddress}
            onChangeText={setBorrowerAddress}
            autoCapitalize="none"
          />
        </ClayCard>

        {/* Loan Amount */}
        <ClayCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Loan Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currency}>₹</Text>
            <TextInput 
              style={styles.amountInput}
              placeholder="5000"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <Text style={styles.helperText}>Range: Any amount · Milestone mode activates above ₹10,00,000</Text>
        </ClayCard>

        {/* Duration */}
        <ClayCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Repayment Duration</Text>
          <View style={styles.optionsGrid}>
            {durationOptions.map((option) => (
              <ClayButton
                key={option.value}
                title={option.label}
                variant={duration === option.value ? 'primary' : 'secondary'}
                onPress={() => setDuration(option.value)}
                style={styles.optionButton}
              />
            ))}
          </View>
        </ClayCard>

        {/* Purpose */}
        <ClayCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Purpose</Text>
          <View style={styles.purposeGrid}>
            {purposeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.purposeOption, purpose === option.value && styles.purposeOptionActive]}
                onPress={() => setPurpose(option.value)}
              >
                <ClayCard style={styles.purposeCard}>
                  <Text style={styles.purposeIcon}>{option.icon}</Text>
                  <Text style={[styles.purposeText, purpose === option.value && styles.purposeTextActive]}>
                    {option.label.replace(/🏥|📚|🚨|💼\s/, '')}
                  </Text>
                </ClayCard>
              </TouchableOpacity>
            ))}
          </View>
        </ClayCard>

        {/* Guardians */}
        <ClayCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Guardian Wallets (3 required)</Text>
          <Text style={styles.helperText}>Trust Score ≥ 50 carries 2× voting weight</Text>
          <TextInput style={[styles.inputBox, { marginTop: 12 }]} placeholder="Guardian 1 (0x...)" value={guardian1} onChangeText={setGuardian1} autoCapitalize="none" />
          <TextInput style={[styles.inputBox, { marginTop: 8 }]} placeholder="Guardian 2 (0x...)" value={guardian2} onChangeText={setGuardian2} autoCapitalize="none" />
          <TextInput style={[styles.inputBox, { marginTop: 8 }]} placeholder="Guardian 3 (0x...)" value={guardian3} onChangeText={setGuardian3} autoCapitalize="none" />
        </ClayCard>

        {/* Interest Rate Preview */}
        <ClayCard style={styles.previewCard}>
          <Text style={styles.previewTitle}>💡 Rate Preview</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Trust Score</Text>
            <Text style={styles.previewValue}>450</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Interest Rate</Text>
            <Text style={styles.previewValue}>5.0% APR</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Total Repayment</Text>
            <Text style={styles.previewValueHighlight}>₹{totalRepayment.toLocaleString('en-IN')}</Text>
          </View>
          {Number(amount) >= 1000000 && (
            <View style={{ marginTop: 10, padding: 8, backgroundColor: '#f3e8ff', borderRadius: 8 }}>
              <Text style={{ fontSize: 12, color: '#7c3aed', textAlign: 'center', fontWeight: 'bold' }}>🏁 Milestone Mode — 4 tranches of 25%</Text>
            </View>
          )}
          {riskInfo && (
            <View style={{ marginTop: 10, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: riskInfo.risk_label === 'Low' ? '#16a34a' : riskInfo.risk_label === 'Medium' ? '#ca8a04' : '#dc2626' }}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold', color: riskInfo.risk_label === 'Low' ? '#16a34a' : riskInfo.risk_label === 'Medium' ? '#ca8a04' : '#dc2626' }}>
                AI Risk: {riskInfo.risk_label} ({(riskInfo.risk_probability * 100).toFixed(0)}%)
              </Text>
            </View>
          )}
        </ClayCard>

        <ClayButton title="🤖 Check AI Risk Score" variant="secondary" onPress={checkRisk} style={{ marginBottom: 12 }} />

        {loading ? (
          <ActivityIndicator color="#3b82f6" size="large" style={{ marginBottom: 16 }} />
        ) : (
          <ClayButton title="📝 Submit Loan Request" variant="primary" onPress={handleSubmit} style={styles.submitButton} />
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e5e7eb' },
  header: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingHorizontal: 24, paddingVertical: 16, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#6b7280' },
  content: { flex: 1, padding: 16 },
  sectionCard: { padding: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  inputBox: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 14, color: '#1f2937' },
  amountContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  currency: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginRight: 8 },
  amountInput: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  helperText: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  optionsGrid: { flexDirection: 'row', gap: 8 },
  optionButton: { flex: 1 },
  purposeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  purposeOption: { width: '48%', marginBottom: 12 },
  purposeOptionActive: { transform: [{ scale: 1.02 }] },
  purposeCard: { padding: 16, alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.6)' },
  purposeIcon: { fontSize: 24, marginBottom: 8 },
  purposeText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  purposeTextActive: { color: '#1f2937' },
  previewCard: { padding: 24, marginBottom: 24, backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  previewTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  previewLabel: { fontSize: 14, color: '#6b7280' },
  previewValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  previewValueHighlight: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  submitButton: { marginHorizontal: 0, marginBottom: 16 },
  bottomSpacing: { height: 100 },
});