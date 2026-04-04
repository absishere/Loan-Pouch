import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ClayCard from '../components/ClayCard';

export default function AnalyticsScreen() {
  const trustScore = 647;
  const maxScore = 850;
  const scorePercentage = (trustScore / maxScore) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trust Score Analytics</Text>
        <Text style={styles.headerSubtitle}>Track your creditworthiness and performance</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Score Overview */}
        <ClayCard style={styles.scoreCard}>
          <View style={styles.scoreSection}>
            {/* Score Circle */}
            <View style={styles.scoreCircleContainer}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{trustScore}</Text>
                <Text style={styles.scoreMax}>/{maxScore}</Text>
              </View>
              <View style={styles.scoreProgress}>
                <View 
                  style={[styles.scoreProgressBar, { width: `${scorePercentage}%` }]} 
                />
              </View>
            </View>

            {/* Score Details */}
            <View style={styles.scoreDetails}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Tier</Text>
                <Text style={styles.scoreTier}>Reliable</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Interest Rate</Text>
                <Text style={styles.scoreRate}>5.0%</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Next Tier</Text>
                <Text style={styles.scoreNext}>Elite (651+)</Text>
              </View>
            </View>
          </View>
        </ClayCard>

        {/* Score Breakdown */}
        <ClayCard style={styles.breakdownCard}>
          <Text style={styles.cardTitle}>Score Breakdown</Text>
          
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>Repayment Punctuality</Text>
              <Text style={styles.breakdownPercent}>35%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '92%', backgroundColor: '#10b981' }]} />
            </View>
            <Text style={styles.breakdownScore}>Excellent (92/100)</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>Transaction Consistency</Text>
              <Text style={styles.breakdownPercent}>25%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '78%', backgroundColor: '#3b82f6' }]} />
            </View>
            <Text style={styles.breakdownScore}>Good (78/100)</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>Network Trust</Text>
              <Text style={styles.breakdownPercent}>20%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '85%', backgroundColor: '#8b5cf6' }]} />
            </View>
            <Text style={styles.breakdownScore}>Very Good (85/100)</Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>Loan-to-Repay Ratio</Text>
              <Text style={styles.breakdownPercent}>20%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '88%', backgroundColor: '#f59e0b' }]} />
            </View>
            <Text style={styles.breakdownScore}>Excellent (88/100)</Text>
          </View>
        </ClayCard>

        {/* Achievement Badges */}
        <ClayCard style={styles.badgesCard}>
          <Text style={styles.cardTitle}>Achievement Badges</Text>
          
          <View style={styles.badgeGrid}>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeIcon}>🏆</Text>
              <Text style={styles.badgeName}>Reliable Borrower</Text>
              <Text style={styles.badgeDesc}>5+ on-time repayments</Text>
            </View>
            
            <View style={styles.badgeItem}>
              <Text style={styles.badgeIcon}>⭐</Text>
              <Text style={styles.badgeName}>Trusted Lender</Text>
              <Text style={styles.badgeDesc}>10+ successful loans</Text>
            </View>
            
            <View style={styles.badgeItem}>
              <Text style={styles.badgeIcon}>🎯</Text>
              <Text style={styles.badgeName}>High Scorer</Text>
              <Text style={styles.badgeDesc}>Score above 600</Text>
            </View>
            
            <View style={[styles.badgeItem, styles.badgeInactive]}>
              <Text style={styles.badgeIcon}>👑</Text>
              <Text style={styles.badgeName}>Elite Member</Text>
              <Text style={styles.badgeDesc}>Score 651+</Text>
            </View>
          </View>
        </ClayCard>

        {/* What-if Simulator */}
        <ClayCard style={styles.simulatorCard}>
          <Text style={styles.cardTitle}>What-if Simulator</Text>
          <Text style={styles.simulatorDesc}>See how your actions affect your Trust Score</Text>
          
          <View style={styles.simulatorItem}>
            <Text style={styles.simulatorAction}>✅ Repay ₹5,000 loan on time</Text>
            <Text style={styles.simulatorResult}>+1 point → 648</Text>
          </View>
          
          <View style={styles.simulatorItem}>
            <Text style={styles.simulatorAction}>❌ Miss payment by 7 days</Text>
            <Text style={styles.simulatorResult}>-1 point → 646</Text>
          </View>
          
          <View style={styles.simulatorItem}>
            <Text style={styles.simulatorAction}>🎯 Reach Elite tier (651+)</Text>
            <Text style={styles.simulatorResult}>Rate: 4.0% (floor)</Text>
          </View>
        </ClayCard>
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
  scoreCard: {
    padding: 24,
    marginBottom: 16,
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scoreMax: {
    fontSize: 16,
    color: '#6b7280',
  },
  scoreProgress: {
    width: 200,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreProgressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  scoreDetails: {
    width: '100%',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  scoreTier: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  scoreRate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  scoreNext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  breakdownCard: {
    padding: 24,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  breakdownItem: {
    marginBottom: 20,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  breakdownPercent: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownScore: {
    fontSize: 12,
    color: '#6b7280',
  },
  badgesCard: {
    padding: 24,
    marginBottom: 16,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeInactive: {
    opacity: 0.5,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  simulatorCard: {
    padding: 24,
    marginBottom: 16,
  },
  simulatorDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  simulatorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  simulatorAction: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    marginRight: 16,
  },
  simulatorResult: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});