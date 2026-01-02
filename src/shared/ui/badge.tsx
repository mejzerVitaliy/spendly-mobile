import { Text, View, ViewProps } from 'react-native';

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '', 
  ...props 
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-secondary',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    destructive: 'bg-destructive',
    success: 'bg-success',
    warning: 'bg-warning',
    outline: 'bg-transparent border-2 border-border',
  }[variant];

  const textClasses = {
    default: 'text-secondary-foreground',
    primary: 'text-primary-foreground',
    secondary: 'text-secondary-foreground',
    destructive: 'text-destructive-foreground',
    success: 'text-success-foreground',
    warning: 'text-warning-foreground',
    outline: 'text-foreground',
  }[variant];

  const sizeClasses = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-1',
    lg: 'px-3 py-1.5',
  }[size];

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  return (
    <View 
      className={`rounded-full inline-flex items-center justify-center ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      <Text className={`${textClasses} ${textSizeClasses} font-semibold`}>
        {children}
      </Text>
    </View>
  );
}
