import { Text, View, ViewProps } from 'react-native';
import { colors } from '@/shared/theme';

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
    elevated: 'bg-card border border-border',
    outlined: 'bg-transparent border border-border',
  }[variant];

  return (
    <View
      className={`rounded-2xl overflow-hidden ${variantClasses} ${className}`}
      style={
        variant === 'elevated'
          ? {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }
          : undefined
      }
      {...props}
    >
      {header && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          {typeof header === 'string' ? (
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>
              {header}
            </Text>
          ) : (
            header
          )}
        </View>
      )}

      <View className="p-4">{children}</View>

      {footer && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {footer}
        </View>
      )}
    </View>
  );
}
