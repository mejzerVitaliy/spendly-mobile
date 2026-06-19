import { useTransactions } from '@/shared/hooks/transactions/use-transactions';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { colors } from '@/shared/theme';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

interface CreateTransactionVoiceProps {
  onSuccess?: () => void;
}

type RecordingState = 'idle' | 'recording' | 'processing';

const CreateTransactionVoice = ({ onSuccess }: CreateTransactionVoiceProps) => {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { parseVoiceMutation } = useTransactions();
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Toast.show({
          type: 'error',
          text1: t('voiceAI.micDeniedTitle'),
          text2: t('voiceAI.micDeniedDesc'),
        });
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      setState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      Toast.show({
        type: 'error',
        text1: t('voiceAI.recordingError'),
        text2: t('voiceAI.recordingErrorDesc'),
      });
    }
  };

  const stopAndSubmit = async () => {
    if (!recordingRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState('processing');

    try {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error('No audio URI');

      const result = await parseVoiceMutation.mutateAsync(uri);
      const count = result.data.length;

      setState('idle');
      setDuration(0);
      onSuccess?.();

      Toast.show({
        type: 'success',
        text1: t('voiceAI.created'),
        text2: t(count === 1 ? 'voiceAI.createdDesc_one' : 'voiceAI.createdDesc_other', { count }),
      });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message ?? t('voiceAI.errorDefault');

      setState('idle');
      setDuration(0);
      recordingRef.current = null;

      Toast.show({
        type: 'error',
        text1: t('voiceAI.errorTitle'),
        text2: message,
      });
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View className="px-5 pt-4 pb-8 items-center">
      <Text className="text-lg font-bold text-foreground mb-1">{t('voiceAI.title')}</Text>
      <Text className="text-sm text-muted-foreground mb-8 text-center">
        {t('voiceAI.subtitle')}
      </Text>

      {state === 'processing' ? (
        <View className="items-center gap-4">
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.primary + '26',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text className="text-muted-foreground text-sm">{t('voiceAI.processing')}</Text>
        </View>
      ) : (
        <View className="items-center gap-4">
          <Pressable
            onPress={state === 'idle' ? startRecording : stopAndSubmit}
            style={({ pressed }) => ({
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor:
                state === 'recording'
                  ? 'rgba(239,68,68,0.15)'
                  : 'rgba(249,115,22,0.15)',
              borderWidth: 2,
              borderColor: state === 'recording' ? '#EF4444' : '#F97316',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons
              name={state === 'recording' ? 'stop' : 'mic'}
              size={40}
              color={state === 'recording' ? '#EF4444' : '#F97316'}
            />
          </Pressable>

          {state === 'recording' ? (
            <View className="items-center gap-1">
              <View className="flex-row items-center gap-2">
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#EF4444',
                  }}
                />
                <Text className="text-foreground font-semibold text-base">
                  {formatDuration(duration)}
                </Text>
              </View>
              <Text className="text-muted-foreground text-sm">
                {t('voiceAI.tapToStop')}
              </Text>
            </View>
          ) : (
            <Text className="text-muted-foreground text-sm">
              {t('voiceAI.tapToStart')}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export { CreateTransactionVoice };
