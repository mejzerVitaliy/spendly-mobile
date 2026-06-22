import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { colors } from '@/shared/theme';

interface GlassViewProps extends ViewProps {
  intensity?: number;
  tint?: 'dark' | 'light' | 'default' | 'systemUltraThinMaterialDark';
  border?: boolean;
  highlight?: boolean;
  borderRadius?: number;
  backgroundColor?: string;
}

export function GlassView({
  intensity,
  tint = 'systemUltraThinMaterialDark',
  border = true,
  highlight = false,
  borderRadius: radius = 16,
  backgroundColor,
  style,
  children,
  ...props
}: GlassViewProps) {
  const blurIntensity = intensity ?? colors.glass.intensity;
  const bg = backgroundColor ?? colors.glass.background;

  const containerStyle = [
    styles.container,
    { borderRadius: radius },
    border && { borderWidth: 1, borderColor: colors.glass.border },
    style,
  ];

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={blurIntensity}
        tint={tint as any}
        style={[containerStyle, { overflow: 'hidden' }]}
        {...props}
      >
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: bg, borderRadius: radius }]} />
        {highlight && (
          <LinearGradient
            colors={[colors.glass.highlight, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFillObject, styles.highlight, { borderRadius: radius }]}
            pointerEvents="none"
          />
        )}
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[containerStyle, { overflow: 'hidden', backgroundColor: colors.card }]} {...props}>
      {highlight && (
        <LinearGradient
          colors={[colors.glass.highlight, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFillObject, styles.highlight, { borderRadius: radius }]}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  highlight: {
    height: '50%',
    top: 0,
    opacity: 0.6,
  },
});
