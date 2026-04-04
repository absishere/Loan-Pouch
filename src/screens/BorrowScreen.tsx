import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

export default function BorrowScreen() {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('7');
  const [purpose, setPurpose] = useState('');

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

  const calculateRepayment = () => {
    const principal = parseFloat(amount) || 5000;
    const rate = 5.2; // Based on Trust Score
    const days = parseInt(duration);
    const interest = (principal * rate * days) / (365 * 100);
    return principal + interest;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Request Loan</Text>
        <Text style={styles.headerSubtitle}>Quick and secure lending</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        
        {/* Loan Amount Card */}
        <ClayCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Loan Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currency}>₹</Text>
            <TextInput 
              style={styles.amountInput}
              placeholder="5,000"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <Text style={styles.helperText}>Range: ₹500 - ₹25,000</Text>
        </ClayCard>

        {/* Duration Selection */}
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

        {/* Purpose Selection */}
        <ClayCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Purpose</Text>
          <View style={styles.purposeGrid}>
            {purposeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.purposeOption,
                  purpose === option.value && styles.purposeOptionActive
                ]}
                onPress={() => setPurpose(option.value)}
              >
                <ClayCard style={styles.purposeCard}>
                  <Text style={styles.purposeIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.purposeText,
                    purpose === option.value && styles.purposeTextActive
                  ]}>
                    {option.label.replace(/🏥|📚|🚨|💼\s/, '')}
                  </Text>
                </ClayCard>
              </TouchableOpacity>
            ))}
          </View>
        </ClayCard>

        {/* Interest Rate Preview */}
        <ClayCard style={styles.previewCard}>
          <Text style={styles.previewTitle}>💡 Rate Preview</Text>
          
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Trust Score</Text>
            <Text style={styles.previewValue}>650 (Reliable)</Text>
          </View>
          
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Interest Rate</Text>
            <Text style={styles.previewValue}>5.2% APR</Text>
          </View>
          
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Total Repayment</Text>
            <Text style={styles.previewValueHighlight}>
              ₹{calculateRepayment().toLocaleString()}
            </Text>
          </View>
        </ClayCard>

        {/* Submit Button */}
        <ClayButton 
          title="📝 Submit Loan Request"
          variant="primary"
          style={styles.submitButton}
          onPress={() => {
            // Handle loan request submission
            console.log('Loan request submitted');
          }}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionCard: {
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  purposeOption: {
    width: '48%',
    marginBottom: 12,
  },
  purposeOptionActive: {
    transform: [{ scale: 1.02 }],
  },
  purposeCard: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  purposeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  purposeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  purposeTextActive: {
    color: '#1f2937',
  },
  previewCard: {
    padding: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  previewLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  previewValueHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  submitButton: {
    marginHorizontal: 0,
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 100,
  },
});