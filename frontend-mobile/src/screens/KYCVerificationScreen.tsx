import React from 'react';
import { StyleSheet, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import ClayCard from '../components/ClayCard';

export default function KYCVerificationScreen() {
  const navigation = useNavigation();

  // Derive the Next.js Web Dashboard URL from the configured API URL
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
  const webLoginUrl = apiUrl.replace(':8000/api', ':3000').replace(':8000', ':3000') + '/login';

  const handleMessage = (event: any) => {
    // We could intercept window.postMessage from the webview here if the Next.js app sends a "VERIFIED" signal
    // For prototype purposes, users will just hit the physical back button or we can provide a manual done button
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <ClayCard style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Secure Identity Scan</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard' as never)}>
            <Text style={styles.doneButton}>Skip to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ClayCard>

      <WebView 
        source={{ uri: webLoginUrl }} 
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },
  header: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backButton: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  doneButton: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  }
});
