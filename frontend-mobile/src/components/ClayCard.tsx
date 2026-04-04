// Clay Card Component for Claymorphism Design
import React from 'react';
import { View, ViewProps } from 'react-native';

interface ClayCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export default function ClayCard({ children, className = '', ...props }: ClayCardProps) {
  return (
    <View 
      className={`bg-white/25 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}