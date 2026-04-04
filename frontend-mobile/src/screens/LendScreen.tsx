import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import { api, LoanData } from '../services/api';

export default function LendScreen() {
  const [filter, setFilter] = useState('All');
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);

  const filterOptions = [
    { value: 'All', label: 'All', icon: '' },
    { value: 'Medical', label: 'Medical', icon: '🏥' },
    { value: 'Education', label: 'Education', icon: '📚' },
    { value: 'Emergency', label: 'Emergency', icon: '🚨' },
    { value: 'Personal', label: 'Personal', icon: '💼' },
  ];

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await api.listLoans();
      setLoans(data.filter(l => l.state === "Pending" || l.state === "Gathering"));
    } catch (e) {
      console.warn("Could not fetch loans", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFund = async (loanId: string) => {
    try {
      Alert.alert("Prototype", "We are skipping wallet signing for the prototype. Check Web Dashboard for live Sepolia funding!");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lend Money</Text>
        <Text style={styles.headerSubtitle}>Help others while earning returns on Sepolia</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        
        {/* Stats Banner */}
        <ClayCard style={styles.statsBanner}>
          <Text style={styles.bannerTitle}>📊 Live Marketplace Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{loans.length}</Text>
              <Text style={styles.statLabel}>Active Requests</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5.0%</Text>
              <Text style={styles.statLabel}>Global Return</Text>
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
          <Text style={styles.sectionTitle}>💰 Live Funding Opportunities</Text>
          
          {loading ? (
             <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
          ) : loans.length === 0 ? (
             <Text style={{ textAlign: 'center', color: '#6b7280', marginTop: 20 }}>No active loan requests on the contract.</Text>
          ) : (
            loans.map((request, idx) => {
              const amountINR = request.amount / 1e18;
              const interestNum = request.interest_amount / 1e18;
              const addr = request.borrower_address;

              return (
                <ClayCard key={idx} style={styles.requestCard}>
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.borrowerInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>0x</Text>
                      </View>
                      <View>
                        <Text style={styles.borrowerName}>{addr.substring(0, 8)}...</Text>
                        <Text style={styles.purpose}>{request.state}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Amount Section */}
                  <View style={styles.amountSection}>
                    <Text style={styles.requestAmount}>₹{amountINR.toLocaleString('en-IN')}</Text>
                    <Text style={styles.duration}>{request.funding_deadline_days} days</Text>
                  </View>

                  {/* Details */}
                  <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Interest Gain</Text>
                      <Text style={styles.interestRate}>+ ₹{interestNum.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Time Remaining</Text>
                      <Text style={styles.timeLeft}>{request.funding_deadline_days}d left</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <ClayButton
                      title="💳 Fund Now"
                      variant="primary"
                      style={styles.actionButton}
                      onPress={() => handleFund(String(idx))}
                    />
                  </View>
                </ClayCard>
              );
            })
          )}
        </View>

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
  statsBanner: { padding: 24, marginBottom: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6b7280' },
  filterCard: { padding: 20, marginBottom: 16 },
  filterTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  filterScroll: { flexDirection: 'row' },
  filterButton: { marginRight: 8, minWidth: 80 },
  requestsSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16, paddingHorizontal: 8 },
  requestCard: { padding: 20, marginBottom: 16, backgroundColor: 'rgba(255, 255, 255, 0.9)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  borrowerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  borrowerName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 2 },
  purpose: { fontSize: 14, color: '#6b7280' },
  amountSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  requestAmount: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  duration: { fontSize: 14, color: '#6b7280', backgroundColor: 'rgba(0, 0, 0, 0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  detailsSection: { marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  detailLabel: { fontSize: 14, color: '#6b7280' },
  interestRate: { fontSize: 14, fontWeight: 'bold', color: '#10b981' },
  timeLeft: { fontSize: 14, fontWeight: '600', color: '#ef4444' },
  actionButtons: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1 },
  bottomSpacing: { height: 100 },
});