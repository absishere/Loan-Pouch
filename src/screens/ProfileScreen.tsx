import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const trustScore = 650;
  const maxScore = 850;
  const scorePercentage = (trustScore / maxScore) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account and settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        
        {/* Profile Info */}
        <ClayCard style={styles.profileCard}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>RS</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Rahul Sharma</Text>
              <Text style={styles.userEmail}>rahul.sharma@email.com</Text>
              <Text style={styles.userPhone}>+91 98765 43210</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editText}>✏️</Text>
            </TouchableOpacity>
          </View>
        </ClayCard>

        {/* Trust Score */}
        <ClayCard style={styles.trustCard}>
          <Text style={styles.sectionTitle}>🏆 Trust Score</Text>
          
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{trustScore}</Text>
              <Text style={styles.scoreMax}>/{maxScore}</Text>
            </View>
            
            <View style={styles.scoreDetails}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Current Tier</Text>
                <Text style={styles.scoreTier}>Reliable</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Interest Rate</Text>
                <Text style={styles.scoreRate}>5.2%</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Next Milestone</Text>
                <Text style={styles.scoreNext}>Elite (651+)</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${scorePercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {651 - trustScore} points to Elite tier
            </Text>
          </View>
        </ClayCard>

        {/* Wallet Info */}
        <ClayCard style={styles.walletCard}>
          <Text style={styles.sectionTitle}>💳 B-INR Wallet</Text>
          
          <View style={styles.walletBalance}>
            <Text style={styles.balanceAmount}>₹15,240</Text>
            <Text style={styles.balanceLabel}>Available Balance</Text>
          </View>
          
          <View style={styles.walletDetails}>
            <Text style={styles.walletAddress}>0x742d35cc...8f9a2b</Text>
            <TouchableOpacity style={styles.copyButton}>
              <Text style={styles.copyText}>📋</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.walletActions}>
            <ClayButton 
              title="💰 Add Funds"
              variant="primary"
              style={styles.walletButton}
              onPress={() => console.log('Add funds')}
            />
            <ClayButton 
              title="💸 Withdraw"
              variant="secondary"
              style={styles.walletButton}
              onPress={() => console.log('Withdraw')}
            />
          </View>
        </ClayCard>

        {/* Security Settings */}
        <ClayCard style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>🔒 Security Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Biometric Authentication</Text>
              <Text style={styles.settingDesc}>Use fingerprint/face unlock</Text>
            </View>
            <Switch 
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#e5e7eb', true: '#1f2937' }}
              thumbColor={biometricEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Loan updates and alerts</Text>
            </View>
            <Switch 
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#1f2937' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingLabel}>🛡️ Recovery Guardians</Text>
            <Text style={styles.settingValue}>3 Added →</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingLabel}>🔑 Change mPIN</Text>
            <Text style={styles.settingValue}>→</Text>
          </TouchableOpacity>
        </ClayCard>

        {/* Quick Actions */}
        <ClayCard style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('History' as never)}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>📊</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Transaction History</Text>
                <Text style={styles.actionDesc}>View all your activity</Text>
              </View>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Analytics' as never)}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>📈</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Trust Score Analytics</Text>
                <Text style={styles.actionDesc}>Detailed score breakdown</Text>
              </View>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>📄</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Export Trust Score</Text>
                <Text style={styles.actionDesc}>Download PDF certificate</Text>
              </View>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>🤝</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Refer Friends</Text>
                <Text style={styles.actionDesc}>Invite others to earn rewards</Text>
              </View>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>💡</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionLabel}>Help & Support</Text>
                <Text style={styles.actionDesc}>Get assistance</Text>
              </View>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </ClayCard>

        {/* Logout Button */}
        <ClayButton 
          title="🚪 Logout"
          variant="secondary"
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Landing' as never)}
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
  profileCard: {
    padding: 20,
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  trustCard: {
    padding: 24,
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(31, 41, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scoreMax: {
    fontSize: 12,
    color: '#6b7280',
  },
  scoreDetails: {
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  scoreTier: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  scoreRate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  scoreNext: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1f2937',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  walletCard: {
    padding: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.05)',
  },
  walletBalance: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  walletDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  walletAddress: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#6b7280',
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  copyText: {
    fontSize: 14,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletButton: {
    flex: 1,
  },
  settingsCard: {
    padding: 24,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsCard: {
    padding: 24,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionArrow: {
    fontSize: 18,
    color: '#6b7280',
  },
  logoutButton: {
    marginHorizontal: 0,
    marginBottom: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  bottomSpacing: {
    height: 100,
  },
});