import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';
import { api, LoanData } from '../services/api';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [loans, setLoans] = useState<LoanData[]>([]);

  useEffect(() => {
    api.listLoans().then(setLoans).catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <ClayCard style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Dashboard</Text>
            <Text style={styles.subGreeting}>Welcome to Loan Pouch!</Text>
          </View>
          <View style={styles.trustBadge}>
            <Text style={styles.trustText}>450</Text>
            <Text style={styles.trustLabel}>New User</Text>
          </View>
        </View>
      </ClayCard>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <ClayCard style={styles.statCard}>
            <Text style={styles.statLabel}>Demo Balance</Text>
            <Text style={styles.statValue}>₹50,000</Text>
          </ClayCard>
          
          <ClayCard style={styles.statCard}>
            <Text style={styles.statLabel}>Global Requests</Text>
            <Text style={styles.statValue}>{loans.length}</Text>
          </ClayCard>
          
          <ClayCard style={styles.statCard}>
            <Text style={styles.statLabel}>Interest Rate</Text>
            <Text style={styles.statValue}>5.0%</Text>
          </ClayCard>
          
          <ClayCard style={styles.statCard}>
            <Text style={styles.statLabel}>Transactions</Text>
            <Text style={styles.statValue}>0</Text>
          </ClayCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <ClayButton 
            title="💰 Request Loan"
            variant="primary"
            style={styles.actionButton}
            onPress={() => navigation.navigate('Borrow' as never)}
          />
          <ClayButton 
            title="💳 Browse Loans"
            variant="secondary"
            style={styles.actionButton}
            onPress={() => navigation.navigate('Lend' as never)}
          />
        </View>

        {/* Navigation Cards */}
        <View style={styles.navGrid}>
          <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Analytics' as never)}>
            <ClayCard style={styles.navCardInner}>
              <Text style={styles.navIcon}>📈</Text>
              <Text style={styles.navTitle}>Analytics</Text>
              <Text style={styles.navDesc}>Trust Score (WIP)</Text>
            </ClayCard>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('History' as never)}>
            <ClayCard style={styles.navCardInner}>
              <Text style={styles.navIcon}>📋</Text>
              <Text style={styles.navTitle}>History</Text>
              <Text style={styles.navDesc}>Tx Records (WIP)</Text>
            </ClayCard>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e5e7eb', paddingHorizontal: 16, paddingTop: 50 },
  header: { marginBottom: 16, paddingVertical: 16 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  subGreeting: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  trustBadge: { alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  trustText: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  trustLabel: { fontSize: 10, color: '#6b7280' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, minWidth: '45%', padding: 16 },
  statLabel: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  actionsSection: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionButton: { flex: 1 },
  navGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  navCard: { width: '48%' },
  navCardInner: { padding: 20, alignItems: 'center' },
  navIcon: { fontSize: 32, marginBottom: 8 },
  navTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  navDesc: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  bottomSpacing: { height: 100 },
});