import { ActivityIndicator, Pressable, PressableProps, Text } from 'react-native';

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
  const baseClasses = 'rounded-lg items-center justify-center flex-row';
  
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  }[size];

  const variantClasses = {
    primary: 'bg-primary active:opacity-90',
    secondary: 'bg-secondary active:opacity-90',
    destructive: 'bg-destructive active:opacity-90',
    outline: 'bg-transparent border-2 border-border active:bg-accent',
    ghost: 'bg-transparent active:bg-accent',
    success: 'bg-success active:opacity-90',
    warning: 'bg-warning active:opacity-90',
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

  return (
    <Pressable 
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${isDisabled ? 'opacity-50' : ''}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#0f172a' : '#ffffff'} 
          className="mr-2"
        />
      )}
      <Text className={`${textClasses} ${textSizeClasses}`}>
        {title}
      </Text>
    </Pressable>
  );
}
