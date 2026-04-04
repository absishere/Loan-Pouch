import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, Rahul!</Text>
        <View style={styles.trustScoreBadge}>
          <Text style={styles.trustScoreText}>Trust Score: 650</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>B-INR Balance</Text>
          <Text style={styles.statValue}>₹15,240</Text>
          <Text style={styles.statSubtext}>≈ $183 USD</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Loans</Text>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statSubtext}>1 borrowed, 1 lent</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Interest Rate</Text>
          <Text style={styles.statValue}>5.2%</Text>
          <Text style={styles.statSubtext}>Based on Trust Score</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Transactions</Text>
          <Text style={styles.statValue}>24</Text>
          <Text style={styles.statSubtext}>All time</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.actionButton, styles.borrowButton]}>
          <Text style={styles.actionButtonText}>🏦 Borrow Money</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.lendButton]}>
          <Text style={styles.actionButtonText}>💰 Lend Money</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        <View style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Text>↑</Text>
          </View>
          <View style={styles.activityDetails}>
            <Text style={styles.activityTitle}>Lent to Priya Sharma</Text>
            <Text style={styles.activitySubtitle}>2 hours ago</Text>
          </View>
          <Text style={styles.activityAmount}>-₹5,000</Text>
        </View>
        
        <View style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Text>↓</Text>
          </View>
          <View style={styles.activityDetails}>
            <Text style={styles.activityTitle}>Received from Amit Kumar</Text>
            <Text style={styles.activitySubtitle}>1 day ago</Text>
          </View>
          <Text style={styles.activityAmount}>+₹3,200</Text>
        </View>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  trustScoreBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trustScoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statSubtext: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  borrowButton: {
    backgroundColor: '#3b82f6',
  },
  lendButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activitySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});