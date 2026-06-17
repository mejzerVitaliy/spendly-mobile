import { View, ViewProps } from 'react-native';
import { colors } from '@/shared/theme';

interface SeparatorProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({
  orientation = 'horizontal',
  style,
  ...props
}: SeparatorProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.border,
          ...(orientation === 'horizontal'
            ? { height: 1, width: '100%', marginVertical: 12 }
            : { width: 1, height: '100%', marginHorizontal: 12 }),
        },
        style,
      ]}
      {...props}
    />
  );
}
