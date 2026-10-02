import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { SettingsHeader } from '@/shared/ui';
import { useReminderSettings } from '@/shared/hooks';
import { colors } from '@/shared/theme';

const DEFAULT_LOCAL_HOUR = 20;

// A JS Date is one instant - "local" vs "UTC" is purely which getter you
// read it with, so building/reading through Date.UTC()/getUTC*() here does
// all the timezone conversion for free, no manual offset math needed. The
// trade-off (same one the server-side comment calls out) is that this is a
// snapshot of the device's current UTC offset: a DST shift after saving
// will drift the fire time by up to an hour until next opened and re-saved.
function utcToLocalDate(hourUtc: number, minuteUtc: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hourUtc, minuteUtc),
  );
}

function defaultLocalDate(): Date {
  const d = new Date();
  d.setHours(DEFAULT_LOCAL_HOUR, 0, 0, 0);
  return d;
}

function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ReminderSettingsScreen() {
  const { t } = useTranslation();
  const { data, isLoading, updateMutation } = useReminderSettings();

  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState<Date>(defaultLocalDate());
  const [showPicker, setShowPicker] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!data || hydrated) return;
    setEnabled(data.enabled);
    setTime(
      data.hourUtc !== null && data.minuteUtc !== null
        ? utcToLocalDate(data.hourUtc, data.minuteUtc)
        : defaultLocalDate(),
    );
    setHydrated(true);
  }, [data, hydrated]);

  const persist = (nextEnabled: boolean, nextTime: Date) => {
    updateMutation.mutate(
      {
        enabled: nextEnabled,
        hourUtc: nextTime.getUTCHours(),
        minuteUtc: nextTime.getUTCMinutes(),
      },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: t('reminderSettings.saved'),
            text2: nextEnabled
              ? t('reminderSettings.savedDesc', { time: formatLocalTime(nextTime) })
              : undefined,
          });
        },
        onError: () => {
          Toast.show({ type: 'error', text1: t('reminderSettings.saveFailed') });
        },
      },
    );
  };

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    persist(value, time);
  };

  const handleTimeChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (!selected) return;
    setTime(selected);
    persist(enabled, selected);
  };

  if (isLoading && !hydrated) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top', 'left', 'right']}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-1 px-5 pt-4">
        <SettingsHeader title={t('reminderSettings.title')} description={t('reminderSettings.subtitle')} />

        <View
          className="rounded-3xl p-5"
          style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl items-center justify-center bg-white/[0.05] border border-white/[0.08]">
              <Ionicons name="alarm-outline" size={20} color={colors.mutedForeground} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">{t('reminderSettings.enable')}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">{t('reminderSettings.enableDesc')}</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {enabled && (
            <>
              <View className="h-px bg-border my-4" />
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">{t('reminderSettings.time')}</Text>
                {Platform.OS === 'android' ? (
                  <Pressable
                    onPress={() => setShowPicker(true)}
                    className="px-3 py-1.5 rounded-xl"
                    style={{ backgroundColor: colors.glass.background, borderWidth: 1, borderColor: colors.border }}
                  >
                    <Text className="text-base font-semibold text-primary">{formatLocalTime(time)}</Text>
                  </Pressable>
                ) : (
                  // iOS's "compact" display is itself the tappable control
                  // (opens its own popover) - no extra Pressable wrapper
                  // needed, unlike Android's imperative modal below.
                  <DateTimePicker value={time} mode="time" display="compact" onChange={handleTimeChange} />
                )}
              </View>

              {Platform.OS === 'android' && showPicker && (
                <DateTimePicker value={time} mode="time" display="default" onChange={handleTimeChange} />
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
