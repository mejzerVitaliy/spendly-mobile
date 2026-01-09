import { View, ViewProps } from 'react-native';

interface SeparatorProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({ 
  orientation = 'horizontal',
  className = '', 
  ...props 
}: SeparatorProps) {
  const orientationClasses = orientation === 'horizontal'
    ? 'h-px w-full'
    : 'w-px h-full';

  return (
    <View 
      className={`bg-border my-3 ${orientationClasses} ${className}`}
      {...props}
    />
  );
}
