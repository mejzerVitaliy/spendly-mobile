import { Text, ViewProps , View } from 'react-native';
import { GlassView } from './glass-view';
import { colors } from '@/shared/theme';

interface GlassCardProps extends ViewProps {
  header?: string | React.ReactNode;
  footer?: React.ReactNode;
  intensity?: number;
  highlight?: boolean;
  borderRadius?: number;
  padding?: number;
  children: React.ReactNode;
}

export function GlassCard({
  children,
  header,
  footer,
  intensity,
  highlight = true,
  borderRadius = 20,
  padding = 16,
  className = '',
  style,
  ...props
}: GlassCardProps) {
  return (
    <GlassView
      intensity={intensity}
      border
      highlight={highlight}
      borderRadius={borderRadius}
      style={[{ overflow: 'hidden' }, style]}
      {...props}
    >
      {header && (
        <View
          style={{
            paddingHorizontal: padding,
            paddingTop: padding,
            paddingBottom: padding * 0.75,
            borderBottomWidth: 1,
            borderBottomColor: colors.glass.border,
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

      <View style={{ padding }}>
        {children}
      </View>

      {footer && (
        <View
          style={{
            paddingHorizontal: padding,
            paddingBottom: padding,
            paddingTop: padding * 0.75,
            borderTopWidth: 1,
            borderTopColor: colors.glass.border,
          }}
        >
          {footer}
        </View>
      )}
    </GlassView>
  );
}
