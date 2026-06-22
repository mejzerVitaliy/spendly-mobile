import { Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '@/shared/stores';
import { colors } from '@/shared/theme';
import { create } from 'zustand';
import { useCoachTargetsStore } from '@/shared/stores/coach-targets';

// ─── Local step store (no persist) ───────────────────────────────────────────

interface CoachStepState {
  coachStep: number;
  setCoachStep: (n: number) => void;
}

const useCoachStepStore = create<CoachStepState>((set) => ({
  coachStep: 0,
  setCoachStep: (n) => set({ coachStep: n }),
}));

// ─── Coach steps ──────────────────────────────────────────────────────────────

const COACH_STEPS = [
  { targetKey: 'create' as const, labelKey: 'coach.step1', icon: 'add-circle-outline' as const },
  { targetKey: 'analytics' as const, labelKey: 'coach.step2', icon: 'bar-chart-outline' as const },
  { targetKey: 'wallets' as const, labelKey: 'coach.step3', icon: 'wallet-outline' as const },
];

const ARROW_SIZE = 10;
const TOOLTIP_MAX_WIDTH = 320;
const HIGHLIGHT_PADDING = 8;

// ─── Main component ───────────────────────────────────────────────────────────

export function InteractiveCoach() {
  const { hasSeenCoach, setHasSeenCoach } = useOnboardingStore();
  const { coachStep, setCoachStep } = useCoachStepStore();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const targets = useCoachTargetsStore();
  const { t } = useTranslation();

  const step = COACH_STEPS[coachStep];
  const isLastStep = coachStep === COACH_STEPS.length - 1;
  const target = targets[step.targetKey];

  const tooltipWidth = Math.min(screenWidth - 32, TOOLTIP_MAX_WIDTH);
  const elementCenterX = target ? target.x + target.width / 2 : screenWidth / 2;
  const tooltipLeft = Math.max(
    16,
    Math.min(elementCenterX - tooltipWidth / 2, screenWidth - tooltipWidth - 16),
  );
  const arrowOffsetX = Math.max(
    ARROW_SIZE,
    Math.min(elementCenterX - tooltipLeft - ARROW_SIZE, tooltipWidth - ARROW_SIZE * 3),
  );
  const tooltipBottom = target ? screenHeight - target.y + HIGHLIGHT_PADDING + 28 : 120;

  const handleNext = () => {
    if (isLastStep) {
      setHasSeenCoach(true);
      setCoachStep(0);
    } else {
      setCoachStep(coachStep + 1);
    }
  };

  const handleDismiss = () => {
    setHasSeenCoach(true);
    setCoachStep(0);
  };

  if (hasSeenCoach) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      {/* Non-interactive dark overlay — tapping background does nothing */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.80)',
        }}
      />

      {/* Tooltip card */}
      <Animated.View
        entering={FadeIn.duration(250)}
        key={coachStep}
        style={{
          position: 'absolute',
          bottom: tooltipBottom,
          left: tooltipLeft,
          width: tooltipWidth,
          backgroundColor: colors.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 18,
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        {/* Arrow pointing down toward the tab bar element */}
        {target && (
          <>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                bottom: -(ARROW_SIZE + 1),
                left: arrowOffsetX - 1,
                width: 0,
                height: 0,
                borderLeftWidth: ARROW_SIZE + 1,
                borderRightWidth: ARROW_SIZE + 1,
                borderTopWidth: ARROW_SIZE + 1,
                borderStyle: 'solid',
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: colors.border,
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                bottom: -ARROW_SIZE,
                left: arrowOffsetX,
                width: 0,
                height: 0,
                borderLeftWidth: ARROW_SIZE,
                borderRightWidth: ARROW_SIZE,
                borderTopWidth: ARROW_SIZE,
                borderStyle: 'solid',
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: colors.card,
              }}
            />
          </>
        )}

        <View className="flex-row items-center gap-3 mb-3">
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(34,211,238,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={step.icon} size={20} color={colors.primary} />
          </View>
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
            {coachStep + 1} / {COACH_STEPS.length}
          </Text>
        </View>

        <Text
          style={{
            color: colors.foreground,
            fontSize: 15,
            fontWeight: '600',
            lineHeight: 22,
            marginBottom: 14,
          }}
        >
          {t(step.labelKey)}
        </Text>

        <View className="flex-row items-center justify-between">
          <Pressable onPress={handleDismiss} hitSlop={10}>
            <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
              {t('coach.dismiss')}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: colors.primaryForeground, fontSize: 14, fontWeight: '600' }}>
              {isLastStep ? t('coach.done') : t('coach.next')}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}
