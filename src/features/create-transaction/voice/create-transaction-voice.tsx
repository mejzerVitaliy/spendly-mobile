import { useTransactions } from '@/shared/hooks/transactions/use-transactions';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

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
          text1: 'Microphone access denied',
          text2: 'Please allow microphone access in settings',
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
        text1: 'Could not start recording',
        text2: 'Please try again',
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
        text1: 'Transactions created',
        text2: `${count} transaction${count > 1 ? 's' : ''} added successfully`,
      });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const message =
        err?.response?.data?.message ?? 'Failed to process voice. Please try again.';

      setState('idle');
      setDuration(0);
      recordingRef.current = null;

      Toast.show({
        type: 'error',
        text1: 'Could not create transaction',
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
      <Text className="text-lg font-bold text-foreground mb-1">Voice Input</Text>
      <Text className="text-sm text-muted-foreground mb-8 text-center">
        Tap the button and describe your transaction
      </Text>

      {state === 'processing' ? (
        <View className="items-center gap-4">
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: 'rgba(139,92,246,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
          <Text className="text-muted-foreground text-sm">Processing...</Text>
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
                Tap to stop and create
              </Text>
            </View>
          ) : (
            <Text className="text-muted-foreground text-sm">
              Tap to start recording
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export { CreateTransactionVoice };
