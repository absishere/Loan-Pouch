import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  const [biometricEnabled, setBiometricEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RS</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Rahul Sharma</Text>
            <Text style={styles.userEmail}>rahul.sharma@email.com</Text>
          </View>
        </View>
      </View>

      {/* Trust Score Card */}
      <View style={styles.trustCard}>
        <Text style={styles.trustTitle}>Trust Score</Text>
        <View style={styles.trustRow}>
          <Text style={styles.trustScore}>650</Text>
          <Text style={styles.trustTier}>Reliable</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '65%' }]} />
        </View>
        <Text style={styles.trustSubtext}>
          Repay 2 more loans on time to reach Elite status (700+)
        </Text>
      </View>

      {/* Wallet Info */}
      <View style={styles.walletCard}>
        <Text style={styles.walletTitle}>💳 Wallet</Text>
        <Text style={styles.walletBalance}>₹15,240</Text>
        <Text style={styles.walletAddress}>0x742d35...8f9a2b</Text>
        <TouchableOpacity style={styles.addFundsButton}>
          <Text style={styles.addFundsText}>Add Funds</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>⚙️ Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>🔒 Biometric Authentication</Text>
          <Switch 
            value={biometricEnabled}
            onValueChange={setBiometricEnabled}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>🔔 Push Notifications</Text>
          <Switch 
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>🛡️ Recovery Guardians</Text>
          <Text style={styles.settingValue}>3 Added</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>📱 Export Trust Score</Text>
          <Text style={styles.settingValue}>PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.actionsTitle}>🚀 Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionLabel}>📊 Transaction History</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionLabel}>🤝 Refer Friends</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionLabel}>💡 Help & Support</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionLabel}>📋 Privacy Policy</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
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
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  trustCard: {
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
  trustTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  trustScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10b981',
    marginRight: 12,
  },
  trustTier: {
    fontSize: 16,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  trustSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  walletCard: {
    backgroundColor: '#1f2937',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  addFundsButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addFundsText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsCard: {
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
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 14,
    color: '#1f2937',
  },
  settingValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsCard: {
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
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionLabel: {
    fontSize: 14,
    color: '#1f2937',
  },
  actionArrow: {
    fontSize: 16,
    color: '#6b7280',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100,
  },
});