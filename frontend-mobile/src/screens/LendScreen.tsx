import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const loanRequests = [
  {
    id: 1,
    borrower: 'Priya Sharma',
    amount: 8000,
    purpose: '🏥 Medical',
    duration: 15,
    trustScore: 720,
    interestRate: 4.8,
    timeLeft: '2 days left',
  },
  {
    id: 2,
    borrower: 'Amit Kumar',
    amount: 3200,
    purpose: '📚 Education', 
    duration: 7,
    trustScore: 680,
    interestRate: 5.2,
    timeLeft: '1 day left',
  },
  {
    id: 3,
    borrower: 'Neha Patel',
    amount: 12000,
    purpose: '🚨 Emergency',
    duration: 30,
    trustScore: 650,
    interestRate: 5.8,
    timeLeft: '3 hours left',
  },
];

export default function LendScreen() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💳 Lend Money</Text>
        <Text style={styles.subtitle}>Help others while earning returns</Text>
      </View>

      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>₹24,500</Text>
          <Text style={styles.statLabel}>Total Lent</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>5.4%</Text>
          <Text style={styles.statLabel}>Avg. Return</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Active Loans</Text>
        </View>
      </View>

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.filterBtn, styles.activeFilter]}>
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>🏥 Medical</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>📚 Education</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>🚨 Emergency</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Loan Request Cards */}
      <View style={styles.requestsContainer}>
        {loanRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.borrowerInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {request.borrower.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View>
                  <Text style={styles.borrowerName}>{request.borrower}</Text>
                  <Text style={styles.purpose}>{request.purpose}</Text>
                </View>
              </View>
              <View style={styles.trustBadge}>
                <Text style={styles.trustScore}>{request.trustScore}</Text>
                <Text style={styles.trustLabel}>Trust</Text>
              </View>
            </View>

            {/* Amount and Details */}
            <View style={styles.cardBody}>
              <View style={styles.amountRow}>
                <Text style={styles.amount}>₹{request.amount.toLocaleString()}</Text>
                <Text style={styles.duration}>{request.duration} days</Text>
              </View>
              
              <View style={styles.detailsRow}>
                <Text style={styles.interestRate}>{request.interestRate}% interest</Text>
                <Text style={styles.timeLeft}>{request.timeLeft}</Text>
              </View>

              <Text style={styles.earnings}>
                Earn ₹{Math.round(request.amount * request.interestRate / 100)} on maturity
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fundButton}>
                <Text style={styles.fundButtonText}>Fund Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

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
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    color: '#1f2937',
  },
  requestsContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  borrowerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  borrowerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  purpose: {
    fontSize: 12,
    color: '#6b7280',
  },
  trustBadge: {
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trustScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  trustLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  cardBody: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  duration: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  interestRate: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  timeLeft: {
    fontSize: 12,
    color: '#ef4444',
  },
  earnings: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 6,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  fundButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  fundButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100,
  },
});