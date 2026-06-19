import { useLanguageStore } from '@/shared/stores';
import { LANGUAGE_NAMES, LANGUAGES, type Language } from '@/shared/i18n';
import { SettingsHeader } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export function LanguageScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          <SettingsHeader
            title={t('language.title')}
            description={t('language.description')}
          />

          <View
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}
          >
            {LANGUAGES.map((lang, index) => {
              const selected = language === lang;
              return (
                <View key={lang}>
                  <Pressable
                    onPress={() => setLanguage(lang as Language)}
                    className="flex-row items-center px-4 py-4 active:opacity-70"
                    style={selected ? { backgroundColor: 'rgba(34,211,238,0.06)' } : undefined}
                  >
                    <View
                      className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                      style={{
                        backgroundColor: selected ? 'rgba(34,211,238,0.12)' : colors.glass.background,
                        borderWidth: 1,
                        borderColor: selected ? 'rgba(34,211,238,0.3)' : colors.glass.border,
                      }}
                    >
                      <Text className="text-[15px]">{lang === 'en' ? '🇬🇧' : '🇷🇺'}</Text>
                    </View>

                    <View className="flex-1">
                      <Text
                        className="text-[15px] font-semibold"
                        style={{ color: selected ? colors.primary : colors.foreground }}
                      >
                        {LANGUAGE_NAMES[lang as Language]}
                      </Text>
                      <Text className="text-[12px] text-muted-foreground mt-0.5">
                        {t(`language.${lang}`)}
                      </Text>
                    </View>

                    {selected && (
                      <View
                        className="w-7 h-7 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(34,211,238,0.15)' }}
                      >
                        <Ionicons name="checkmark" size={15} color={colors.primary} />
                      </View>
                    )}
                  </Pressable>

                  {index < LANGUAGES.length - 1 && (
                    <View style={{ height: 1, backgroundColor: colors.glass.border, marginLeft: 60 }} />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
