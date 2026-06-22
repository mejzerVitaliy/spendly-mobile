import { SettingsHeader } from '@/shared/ui';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme';
import { useTranslation } from 'react-i18next';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function LinkRow({
  icon,
  label,
  subtitle,
  url,
}: {
  icon: IoniconsName;
  label: string;
  subtitle?: string;
  url: string;
}) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      className="flex-row items-center px-4 py-4 gap-3 active:opacity-60"
    >
      <View className="w-10 h-10 rounded-xl items-center justify-center bg-white/[0.05] border border-white/[0.08]">
        <Ionicons name={icon} size={20} color={colors.mutedForeground} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-foreground">{label}</Text>
        {subtitle && (
          <Text className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function SupportAboutScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-5">
          <SettingsHeader
            title={t('support.title')}
            description={t('support.description')}
          />

          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            {t('support.contact')}
          </Text>
          <View
            className="rounded-3xl overflow-hidden mb-5"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}
          >
            <LinkRow
              icon="mail-outline"
              label={t('support.emailSupport')}
              subtitle="support@spendly.app"
              url="mailto:support@spendly-ai.com"
            />
          </View>

          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            {t('support.legal')}
          </Text>
          <View
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}
          >
            <LinkRow
              icon="shield-checkmark-outline"
              label={t('support.privacyPolicy')}
              url="https://spendly-ai.com/privacy"
            />
            <View className="h-px bg-border" />
            <LinkRow
              icon="document-text-outline"
              label={t('support.termsOfUse')}
              url="https://spendly-ai.com/terms"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
