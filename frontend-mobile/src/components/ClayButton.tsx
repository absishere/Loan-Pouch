// Clay Button Component for Claymorphism Design
import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ClayButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export default function ClayButton({ 
  title, 
  variant = 'primary', 
  className = '',
  ...props 
}: ClayButtonProps) {
  const baseClasses = "px-8 py-4 rounded-full font-medium text-lg";
  const variantClasses = {
    primary: "bg-black",
    secondary: "bg-white/25 backdrop-blur-lg border border-white/20"
  };
  
  const textClasses = {
    primary: "text-white font-bold text-center",
    secondary: "text-gray-800 font-bold text-center"
  };

  return (
    <TouchableOpacity 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <Text className={textClasses[variant]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}