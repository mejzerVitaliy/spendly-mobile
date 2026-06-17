import { SettingsHeader } from '@/shared/ui';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/shared/theme';

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
      <View
        className="w-9 h-9 rounded-2xl items-center justify-center"
        style={{ backgroundColor: colors.glass.background, borderWidth: 1, borderColor: colors.glass.border }}
      >
        <Ionicons name={icon} size={18} color={colors.mutedForeground} />
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
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-5">
          <SettingsHeader
            title="Support & About"
            description="Help, contacts and legal information"
          />

          {/* Contact */}
          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Contact
          </Text>
          <View
            className="rounded-3xl overflow-hidden mb-5"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}
          >
            <LinkRow
              icon="mail-outline"
              label="Email Support"
              subtitle="support@spendly.app"
              url="mailto:support@spendly.app"
            />
          </View>

          {/* Legal */}
          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Legal
          </Text>
          <View
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}
          >
            <LinkRow
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              url="https://spendly.app/privacy"
            />
            <View style={{ height: 1, backgroundColor: colors.glass.border, marginLeft: 56 }} />
            <LinkRow
              icon="document-text-outline"
              label="Terms of Use"
              url="https://spendly.app/terms"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
