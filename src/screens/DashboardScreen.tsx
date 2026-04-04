// Minimalistic Dashboard - Matches Web Design
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

export default function DashboardScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <ClayCard style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Dashboard</Text>
            <Text style={styles.subGreeting}>Welcome back, Rahul!</Text>
          </View>
          <View style={styles.trustBadge}>
            <Text style={styles.trustText}>650</Text>
            <Text style={styles.trustLabel}>Reliable</Text>
          </View>
        </View>
      </ClayCard>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Grid - Clean Layout */}
        <View style={styles.statsGrid}>
          <ClayCard style={styles.statCard}>
            <Text style={styles.statLabel}>B-INR Balance</Text>
            <Text style={styles.statValue}>₹15,240</Text>
          </ClayCard>
          
          <ClayCard style={styles.statCard}>
            <Text style={styles.statLabel}>Active Loans</Text>
            <Text style={styles.statValue}>2</Text>
          </ClayCard>
          
          <ClayCard style={styles.statCard}>
            <Text style={styles.statLabel}>Interest Rate</Text>
            <Text style={styles.statValue}>5.2%</Text>
          </ClayCard>
          
          <ClayCard style={styles.statCard}>
            <Text style={styles.statLabel}>Transactions</Text>
            <Text style={styles.statValue}>24</Text>
          </ClayCard>
        </View>

        {/* Quick Actions - Minimalistic */}
        <View style={styles.actionsSection}>
          <ClayButton 
            title="💰 Borrow Money"
            variant="primary"
            style={styles.actionButton}
            onPress={() => navigation.navigate('Borrow' as never)}
          />
          <ClayButton 
            title="💳 Lend Money"
            variant="secondary"
            style={styles.actionButton}
            onPress={() => navigation.navigate('Lend' as never)}
          />
        </View>

        {/* Navigation Cards */}
        <View style={styles.navGrid}>
          <TouchableOpacity 
            style={styles.navCard}
            onPress={() => navigation.navigate('Analytics' as never)}
          >
            <ClayCard style={styles.navCardInner}>
              <Text style={styles.navIcon}>📈</Text>
              <Text style={styles.navTitle}>Analytics</Text>
              <Text style={styles.navDesc}>Trust Score & Performance</Text>
            </ClayCard>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navCard}
            onPress={() => navigation.navigate('History' as never)}
          >
            <ClayCard style={styles.navCardInner}>
              <Text style={styles.navIcon}>📋</Text>
              <Text style={styles.navTitle}>History</Text>
              <Text style={styles.navDesc}>Transaction Records</Text>
            </ClayCard>
          </TouchableOpacity>
        </View>

        {/* Recent Activity - Clean Cards */}
        <ClayCard style={styles.activityCard}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.iconText}>↑</Text>
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>Lent to Priya Sharma</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
            <Text style={styles.activityAmount}>-₹5,000</Text>
          </View>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.iconText}>↓</Text>
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>Received from Amit Kumar</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
            <Text style={styles.activityAmount}>+₹3,200</Text>
          </View>
        </ClayCard>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subGreeting: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  trustBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  trustText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  trustLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  activityCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
    color: '#6b7280',
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  activityTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  navGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  navCard: {
    width: '48%',
  },
  navCardInner: {
    padding: 20,
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  navDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});