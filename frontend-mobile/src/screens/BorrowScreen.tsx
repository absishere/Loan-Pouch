import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { api } from '../services/api';

const DURATIONS = [7, 15, 30];
const PURPOSES = ['🏥 Medical', '📚 Education', '🚨 Emergency', '💼 Personal'];

export default function BorrowScreen() {
  const [amount, setAmount] = useState('5000');
  const [duration, setDuration] = useState(7);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [borrowerAddress, setBorrowerAddress] = useState('');
  const [guardian1, setGuardian1] = useState('');
  const [guardian2, setGuardian2] = useState('');
  const [guardian3, setGuardian3] = useState('');
  const [loading, setLoading] = useState(false);
  const [riskInfo, setRiskInfo] = useState<{ risk_label: string; risk_probability: number } | null>(null);

  const amountWei = Math.floor(Number(amount) * 1e18);
  const interestRate = 0.05;
  const interestWei = Math.floor(amountWei * interestRate * (duration / 365));
  const totalRepayment = Number(amount) + interestWei / 1e18;

  const checkRisk = async () => {
    try {
      const res = await api.getRiskScore(450, Number(amount), duration);
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
      setLoading(true);
      const res = await api.requestLoan({
        borrower_address: borrowerAddress,
        amount: amountWei,
        interest_amount: interestWei,
        guardians: [guardian1, guardian2, guardian3],
        funding_deadline_days: duration,
      });
      Alert.alert('✅ Loan Requested!', `Transaction: ${res.tx_hash}`);
    } catch (e: any) {
      Alert.alert('❌ Failed', e?.message ?? 'Loan request failed. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (label?: string) =>
    label === 'Low' ? '#16a34a' : label === 'Medium' ? '#ca8a04' : '#dc2626';

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>💰 Request a Loan</Text>
        <Text style={styles.subtitle}>Secured by blockchain · B-INR powered</Text>
      </View>

      {/* Wallet Address */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Wallet Address</Text>
        <TextInput
          style={styles.input}
          placeholder="0x..."
          value={borrowerAddress}
          onChangeText={setBorrowerAddress}
          autoCapitalize="none"
        />
      </View>

      {/* Amount */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Loan Amount (₹)</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currency}>₹</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="5,000"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
        <Text style={styles.helper}>Enter any amount · Milestone mode auto-activates above ₹10,00,000</Text>
      </View>

      {/* Duration */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Repayment Period</Text>
        <View style={styles.durationButtons}>
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.durationBtn, duration === d && styles.activeDuration]}
              onPress={() => setDuration(d)}
            >
              <Text style={[styles.durationText, duration === d && styles.activeDurationText]}>
                {d} days
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Purpose */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Purpose</Text>
        <View style={styles.purposeButtons}>
          {PURPOSES.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.purposeBtn, purpose === p && styles.activePurpose]}
              onPress={() => setPurpose(p)}
            >
              <Text style={[styles.purposeText, purpose === p && styles.activePurposeText]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Guardians */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Guardian Wallets (3 required)</Text>
        <Text style={styles.helper}>Guardians with Trust Score ≥ 50 carry 2× voting weight</Text>
        {[guardian1, guardian2, guardian3].map((g, i) => (
          <TextInput
            key={i}
            style={[styles.input, { marginTop: i === 0 ? 8 : 4 }]}
            placeholder={`Guardian ${i + 1} address (0x...)`}
            value={g}
            onChangeText={[setGuardian1, setGuardian2, setGuardian3][i]}
            autoCapitalize="none"
          />
        ))}
      </View>

      {/* Preview */}
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Loan Summary</Text>
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Amount</Text>
          <Text style={styles.rateValue}>₹{Number(amount).toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Interest (5% APR)</Text>
          <Text style={styles.rateValue}>₹{(interestWei / 1e18).toFixed(2)}</Text>
        </View>
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Total Repayment</Text>
          <Text style={[styles.rateValue, { color: '#1f2937' }]}>₹{totalRepayment.toFixed(2)}</Text>
        </View>
        {Number(amount) >= 1000000 && (
          <View style={styles.milestoneTag}>
            <Text style={styles.milestoneText}>🏁 Milestone Mode — funds released in 4 tranches of 25%</Text>
          </View>
        )}
        {riskInfo && (
          <View style={[styles.riskTag, { borderColor: riskColor(riskInfo.risk_label) }]}>
            <Text style={[styles.riskText, { color: riskColor(riskInfo.risk_label) }]}>
              AI Risk: {riskInfo.risk_label} ({(riskInfo.risk_probability * 100).toFixed(0)}%)
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.riskButton} onPress={checkRisk}>
        <Text style={styles.riskButtonText}>🤖 Check AI Risk Score</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.requestButton} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.requestButtonText}>📝 Submit Loan Request</Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { padding: 20, paddingTop: 50, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  card: { backgroundColor: 'white', margin: 12, padding: 18, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 14, color: '#1f2937', backgroundColor: '#f9fafb' },
  amountContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#3b82f6', borderRadius: 8, padding: 12 },
  currency: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', marginRight: 8 },
  amountInput: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  helper: { fontSize: 11, color: '#9ca3af', marginTop: 6 },
  durationButtons: { flexDirection: 'row', gap: 8 },
  durationBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
  activeDuration: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  durationText: { fontSize: 14, fontWeight: '600', color: '#4b5563' },
  activeDurationText: { color: 'white' },
  purposeButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  purposeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db' },
  activePurpose: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  purposeText: { fontSize: 13, color: '#1f2937' },
  activePurposeText: { color: 'white' },
  previewCard: { backgroundColor: '#f0f9ff', margin: 12, padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#bfdbfe' },
  previewTitle: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rateLabel: { fontSize: 14, color: '#6b7280' },
  rateValue: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6' },
  milestoneTag: { backgroundColor: '#f3e8ff', borderRadius: 8, padding: 10, marginTop: 10 },
  milestoneText: { fontSize: 12, color: '#7c3aed', fontWeight: '600' },
  riskTag: { borderRadius: 8, borderWidth: 1.5, padding: 10, marginTop: 8 },
  riskText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  riskButton: { backgroundColor: '#6366f1', marginHorizontal: 12, marginTop: 4, padding: 14, borderRadius: 12, alignItems: 'center' },
  riskButtonText: { color: 'white', fontSize: 15, fontWeight: '600' },
  requestButton: { backgroundColor: '#3b82f6', margin: 12, marginTop: 8, padding: 16, borderRadius: 12, alignItems: 'center' },
  requestButtonText: { color: 'white', fontSize: 17, fontWeight: 'bold' },
  bottomSpacing: { height: 100 },
});