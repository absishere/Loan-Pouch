import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function BorrowScreen() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💰 Request a Loan</Text>
        <Text style={styles.subtitle}>Quick and secure lending</Text>
      </View>

      {/* Loan Amount Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Loan Amount</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currency}>₹</Text>
          <TextInput 
            style={styles.amountInput}
            placeholder="5,000"
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.helper}>Range: ₹500 - ₹25,000</Text>
      </View>

      {/* Duration Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Repayment Duration</Text>
        <View style={styles.durationButtons}>
          <TouchableOpacity style={[styles.durationBtn, styles.activeDuration]}>
            <Text style={styles.durationText}>7 days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.durationBtn}>
            <Text style={styles.durationText}>15 days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.durationBtn}>
            <Text style={styles.durationText}>30 days</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Purpose Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Purpose</Text>
        <View style={styles.purposeButtons}>
          <TouchableOpacity style={styles.purposeBtn}>
            <Text style={styles.purposeText}>🏥 Medical</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.purposeBtn}>
            <Text style={styles.purposeText}>📚 Education</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.purposeBtn}>
            <Text style={styles.purposeText}>🚨 Emergency</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.purposeBtn}>
            <Text style={styles.purposeText}>💼 Personal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Interest Rate Preview */}
      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Interest Rate Preview</Text>
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Based on Trust Score (650)</Text>
          <Text style={styles.rateValue}>5.2% APR</Text>
        </View>
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Total Repayment</Text>
          <Text style={styles.rateValue}>₹5,090</Text>
        </View>
      </View>

      {/* Request Button */}
      <TouchableOpacity style={styles.requestButton}>
        <Text style={styles.requestButtonText}>📝 Submit Loan Request</Text>
      </TouchableOpacity>
      
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
  },
  currency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  helper: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  durationBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  activeDuration: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  purposeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  purposeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  purposeText: {
    fontSize: 14,
    color: '#1f2937',
  },
  previewCard: {
    backgroundColor: '#f0f9ff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rateLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  rateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  requestButton: {
    backgroundColor: '#3b82f6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100,
  },
});