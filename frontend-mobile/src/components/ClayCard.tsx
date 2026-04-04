// Claymorphism Card Component - Matches Web Design
import React, { useState, useEffect } from 'react';
import { View, ViewStyle, StyleSheet, Animated } from 'react-native';

interface ClayCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animate?: boolean;
}

export default function ClayCard({ children, style, animate = false }: ClayCardProps) {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (animate) {
      const startPulse = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.02,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      startPulse();
    }
  }, [animate]);

  return (
    <Animated.View 
      style={[
        styles.card, 
        style,
        animate && { transform: [{ scale: pulseAnim }] }
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});