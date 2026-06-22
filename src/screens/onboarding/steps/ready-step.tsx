import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors } from '@/shared/theme';

interface ReadyStepProps {
  onCreateFirst: () => void;
  isLoading: boolean;
}

export function ReadyStep({ onCreateFirst, isLoading }: ReadyStepProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Animated.View entering={FadeIn.duration(500).delay(100)} className="items-center mb-8">
        <View
          className="items-center justify-center rounded-full mb-6"
          style={{
            width: 120,
            height: 120,
            backgroundColor: 'rgba(34,211,238,0.12)',
            borderWidth: 1.5,
            borderColor: 'rgba(34,211,238,0.35)',
          }}
        >
          <Ionicons name="checkmark-circle" size={58} color={colors.primary} />
        </View>

        <Animated.Text
          entering={FadeInUp.duration(400).delay(200)}
          className="text-3xl font-bold text-foreground text-center mb-3"
        >
          {t('onboarding.readyTitle')}
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.duration(400).delay(300)}
          className="text-base text-muted-foreground text-center leading-6"
        >
          {t('onboarding.readySubtitle')}
        </Animated.Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(450)} className="w-full gap-3">
        <Pressable
          onPress={onCreateFirst}
          disabled={isLoading}
          className="rounded-2xl py-4 items-center flex-row justify-center gap-2"
          style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 }}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primaryForeground} />
          <Text className="font-semibold text-base" style={{ color: colors.primaryForeground }}>
            {t('onboarding.createFirst')}
          </Text>
        </Pressable>

        <Pressable onPress={onCreateFirst} disabled={isLoading} className="py-3 items-center">
          <Text className="text-muted-foreground text-sm">{t('onboarding.skipForNow')}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
