import { Text, View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  header?: string | React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ 
  children, 
  variant = 'default',
  header,
  footer,
  className = '', 
  ...props 
}: CardProps) {
  const variantClasses = {
    default: 'bg-card border border-border',
    elevated: 'bg-card shadow-lg',
    outlined: 'bg-transparent border-2 border-border',
  }[variant];

  return (
    <View 
      className={`rounded-lg overflow-hidden ${variantClasses} ${className}`}
      {...props}
    >
      {header && (
        <View className="px-4 pt-4 pb-3 border-b border-border">
          {typeof header === 'string' ? (
            <Text className="text-lg font-semibold text-card-foreground">
              {header}
            </Text>
          ) : (
            header
          )}
        </View>
      )}
      
      <View className="p-4">
        {children}
      </View>
      
      {footer && (
        <View className="px-4 pb-4 pt-3 border-t border-border">
          {footer}
        </View>
      )}
    </View>
  );
}
