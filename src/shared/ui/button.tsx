import { ActivityIndicator, Pressable, PressableProps, Text } from 'react-native';
import { colors } from '@/shared/theme';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded-2xl items-center justify-center flex-row';

  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3.5',
    lg: 'px-8 py-4',
  }[size];

  const variantClasses = {
    primary: 'bg-primary active:opacity-80',
    secondary: 'bg-secondary active:opacity-80',
    destructive: 'bg-destructive active:opacity-80',
    outline: 'bg-transparent border border-border active:bg-glass',
    ghost: 'bg-transparent active:bg-glass',
    success: 'bg-success active:opacity-80',
    warning: 'bg-warning active:opacity-80',
  }[variant];

  const textClasses = {
    primary: 'text-primary-foreground font-semibold',
    secondary: 'text-secondary-foreground font-semibold',
    destructive: 'text-destructive-foreground font-semibold',
    outline: 'text-foreground font-semibold',
    ghost: 'text-foreground font-semibold',
    success: 'text-success-foreground font-semibold',
    warning: 'text-warning-foreground font-semibold',
  }[variant];

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  const isDisabled = disabled || isLoading;

  const spinnerColor =
    variant === 'outline' || variant === 'ghost'
      ? colors.foreground
      : variant === 'primary'
      ? colors.primaryForeground
      : colors.foreground;

  return (
    <Pressable
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${isDisabled ? 'opacity-40' : ''}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <ActivityIndicator size="small" color={spinnerColor} className="mr-2" />
      )}
      <Text className={`${textClasses} ${textSizeClasses}`}>{title}</Text>
    </Pressable>
  );
}
