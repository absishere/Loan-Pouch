import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

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
    tier: 'Elite',
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
    tier: 'Reliable',
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
    tier: 'Reliable',
  },
];

export default function LendScreen() {
  const [filter, setFilter] = useState('All');

  const filterOptions = [
    { value: 'All', label: 'All', icon: '' },
    { value: 'Medical', label: 'Medical', icon: '🏥' },
    { value: 'Education', label: 'Education', icon: '📚' },
    { value: 'Emergency', label: 'Emergency', icon: '🚨' },
    { value: 'Personal', label: 'Personal', icon: '💼' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lend Money</Text>
        <Text style={styles.headerSubtitle}>Help others while earning returns</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        
        {/* Stats Banner */}
        <ClayCard style={styles.statsBanner}>
          <Text style={styles.bannerTitle}>📊 Your Lending Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹24,500</Text>
              <Text style={styles.statLabel}>Total Lent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5.4%</Text>
              <Text style={styles.statLabel}>Avg. Return</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Active Loans</Text>
            </View>
          </View>
        </ClayCard>

        {/* Filter Options */}
        <ClayCard style={styles.filterCard}>
          <Text style={styles.filterTitle}>Filter by Purpose</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {filterOptions.map((option) => (
              <ClayButton
                key={option.value}
                title={`${option.icon} ${option.label}`.trim()}
                variant={filter === option.value ? 'primary' : 'secondary'}
                onPress={() => setFilter(option.value)}
                style={styles.filterButton}
              />
            ))}
          </ScrollView>
        </ClayCard>

        {/* Loan Requests */}
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>💰 Available Opportunities</Text>
          
          {loanRequests.map((request) => (
            <ClayCard key={request.id} style={styles.requestCard}>
              
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
                
                <View style={styles.trustContainer}>
                  <View style={styles.trustBadge}>
                    <Text style={styles.trustScore}>{request.trustScore}</Text>
                    <Text style={styles.trustLabel}>{request.tier}</Text>
                  </View>
                </View>
              </View>

              {/* Amount Section */}
              <View style={styles.amountSection}>
                <Text style={styles.requestAmount}>₹{request.amount.toLocaleString()}</Text>
                <Text style={styles.duration}>{request.duration} days</Text>
              </View>

              {/* Details */}
              <View style={styles.detailsSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Interest Rate</Text>
                  <Text style={styles.interestRate}>{request.interestRate}%</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Your Earnings</Text>
                  <Text style={styles.earnings}>
                    ₹{Math.round(request.amount * request.interestRate / 100)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time Remaining</Text>
                  <Text style={styles.timeLeft}>{request.timeLeft}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <ClayButton
                  title="View Details"
                  variant="secondary"
                  style={styles.actionButton}
                  onPress={() => console.log('View details')}
                />
                <ClayButton
                  title="💳 Fund Now"
                  variant="primary"
                  style={styles.actionButton}
                  onPress={() => console.log('Fund loan')}
                />
              </View>

            </ClayCard>
          ))}
        </View>

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
  statsBanner: {
    padding: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  filterCard: {
    padding: 20,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    marginRight: 8,
    minWidth: 80,
  },
  requestsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  requestCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  borrowerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  borrowerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  purpose: {
    fontSize: 14,
    color: '#6b7280',
  },
  trustContainer: {
    alignItems: 'center',
  },
  trustBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  trustScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  trustLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  requestAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  duration: {
    fontSize: 14,
    color: '#6b7280',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  interestRate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  earnings: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  timeLeft: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 100,
  },
});