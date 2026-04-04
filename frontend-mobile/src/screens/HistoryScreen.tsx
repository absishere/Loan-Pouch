import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ClayCard from '../components/ClayCard';
import ClayButton from '../components/ClayButton';

interface Transaction {
  id: string;
  type: 'borrow' | 'lend';
  amount: number;
  status: 'completed' | 'active' | 'overdue';
  date: string;
  counterparty: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'borrow',
    amount: 5000,
    status: 'completed',
    date: '2024-03-15',
    counterparty: 'Priya Sharma'
  },
  {
    id: '2',
    type: 'lend',
    amount: 3000,
    status: 'active',
    date: '2024-03-20',
    counterparty: 'Rahul Kumar'
  },
  {
    id: '3',
    type: 'borrow',
    amount: 8000,
    status: 'completed',
    date: '2024-03-10',
    counterparty: 'Anita Patel'
  },
  {
    id: '4',
    type: 'lend',
    amount: 2500,
    status: 'overdue',
    date: '2024-02-28',
    counterparty: 'Vikram Singh'
  },
];

export default function HistoryScreen() {
  const [filter, setFilter] = useState<'all' | 'borrow' | 'lend'>('all');

  const filteredTransactions = mockTransactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'active': return '#3b82f6';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'active': return 'Active';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <Text style={styles.headerSubtitle}>View all your lending and borrowing activity</Text>
        </View>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportText}>📊 Export</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Filter Tabs */}
        <ClayCard style={styles.filterCard}>
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'borrow' && styles.filterTabActive]}
              onPress={() => setFilter('borrow')}
            >
              <Text style={[styles.filterTabText, filter === 'borrow' && styles.filterTabTextActive]}>
                Borrowed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'lend' && styles.filterTabActive]}
              onPress={() => setFilter('lend')}
            >
              <Text style={[styles.filterTabText, filter === 'lend' && styles.filterTabTextActive]}>
                Lent
              </Text>
            </TouchableOpacity>
          </View>
        </ClayCard>

        {/* Summary Stats */}
        <ClayCard style={styles.statsCard}>
          <Text style={styles.cardTitle}>Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹18,500</Text>
              <Text style={styles.statLabel}>Total Borrowed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹5,500</Text>
              <Text style={styles.statLabel}>Total Lent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>75%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </ClayCard>

        {/* Transaction List */}
        <ClayCard style={styles.transactionCard}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          
          {filteredTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Text style={styles.transactionEmoji}>
                  {transaction.type === 'borrow' ? '💰' : '💳'}
                </Text>
              </View>
              
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionType}>
                  {transaction.type === 'borrow' ? 'Borrowed from' : 'Lent to'}
                </Text>
                <Text style={styles.transactionCounterparty}>
                  {transaction.counterparty}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
              
              <View style={styles.transactionRight}>
                <Text style={styles.transactionAmount}>
                  {transaction.type === 'borrow' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: `${getStatusColor(transaction.status)}20` }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(transaction.status) }
                  ]}>
                    {getStatusText(transaction.status)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          
          {filteredTransactions.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions found</Text>
              <Text style={styles.emptySubtext}>
                Your transaction history will appear here
              </Text>
            </View>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  exportButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exportText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterCard: {
    padding: 16,
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#1f2937',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: 'white',
  },
  statsCard: {
    padding: 24,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  transactionCard: {
    padding: 24,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  transactionCounterparty: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});