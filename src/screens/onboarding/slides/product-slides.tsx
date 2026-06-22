import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeInUp,
  FadeIn,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors } from '@/shared/theme';
import { useLanguageStore } from '@/shared/stores';
import { LANGUAGES, LANGUAGE_NAMES, type Language } from '@/shared/i18n';

// ─── Language Selector ────────────────────────────────────────────────────────

function LanguagePicker() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <View
      className="flex-row rounded-xl overflow-hidden"
      style={{ borderWidth: 1, borderColor: colors.border }}
    >
      {LANGUAGES.map((lang) => {
        const active = language === lang;
        return (
          <Pressable
            key={lang}
            onPress={() => setLanguage(lang as Language)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              backgroundColor: active ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: active ? colors.primaryForeground : colors.mutedForeground,
              }}
            >
              {LANGUAGE_NAMES[lang as Language]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Illustrations ────────────────────────────────────────────────────────────

function WelcomeIllustration() {
  return (
    <Animated.View entering={FadeIn.duration(600)} className="items-center justify-center flex-1">
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: 160,
          height: 160,
          backgroundColor: 'rgba(34,211,238,0.12)',
          borderWidth: 1.5,
          borderColor: 'rgba(34,211,238,0.35)',
        }}
      >
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 110,
            height: 110,
            backgroundColor: 'rgba(34,211,238,0.18)',
            borderWidth: 1.5,
            borderColor: 'rgba(34,211,238,0.5)',
          }}
        >
          <Text
            style={{
              fontSize: 42,
              fontWeight: '800',
              color: colors.primary,
              letterSpacing: -1,
            }}
          >
            S
          </Text>
        </View>
      </View>

      <View style={{ position: 'absolute', top: 8, right: 40 }}>
        <Ionicons name="sparkles" size={18} color={colors.primary} />
      </View>
      <View style={{ position: 'absolute', bottom: 20, left: 28 }}>
        <Ionicons name="star" size={10} color="rgba(34,211,238,0.6)" />
      </View>
      <View style={{ position: 'absolute', top: 30, left: 32 }}>
        <Ionicons name="star" size={7} color="rgba(34,211,238,0.4)" />
      </View>
      <View style={{ position: 'absolute', bottom: 40, right: 20 }}>
        <Ionicons name="sparkles" size={14} color="rgba(34,211,238,0.5)" />
      </View>
    </Animated.View>
  );
}

function AiTextIllustration() {
  return (
    <Animated.View entering={FadeInUp.duration(500)} className="items-center justify-center flex-1 gap-4">
      <View
        className="rounded-2xl px-5 py-4 w-full"
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          maxWidth: 300,
        }}
      >
        <View className="flex-row items-center gap-2 mb-3">
          <View
            className="rounded-full items-center justify-center"
            style={{ width: 28, height: 28, backgroundColor: 'rgba(34,197,94,0.15)' }}
          >
            <Ionicons name="sparkles" size={14} color={colors.success} />
          </View>
          <Text className="text-muted-foreground text-xs font-medium">AI Input</Text>
        </View>
        <Text className="text-foreground text-sm leading-5">
          &quot;I spent $25 on groceries yesterday&quot;
        </Text>
      </View>

      <View className="items-center gap-1">
        <Ionicons name="chevron-down" size={16} color={colors.primary} />
        <Ionicons name="chevron-down" size={16} color="rgba(34,211,238,0.5)" />
      </View>

      <View
        className="rounded-2xl px-5 py-4 w-full"
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: 'rgba(34,211,238,0.3)',
          maxWidth: 300,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <View
              className="rounded-xl items-center justify-center"
              style={{ width: 34, height: 34, backgroundColor: 'rgba(34,211,238,0.12)' }}
            >
              <Ionicons name="cart-outline" size={18} color={colors.primary} />
            </View>
            <View>
              <Text className="text-foreground text-sm font-semibold">Groceries</Text>
              <Text className="text-muted-foreground text-xs">Yesterday</Text>
            </View>
          </View>
          <Text className="text-foreground font-bold text-base">-$25.00</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View
            className="rounded-full items-center justify-center"
            style={{ width: 16, height: 16, backgroundColor: 'rgba(34,197,94,0.2)' }}
          >
            <Ionicons name="checkmark" size={10} color={colors.success} />
          </View>
          <Text style={{ color: colors.success, fontSize: 11 }}>Transaction created</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function AiVoiceIllustration() {
  const ring1 = useSharedValue(1);
  const ring2 = useSharedValue(1);
  const ring3 = useSharedValue(1);
  const op1 = useSharedValue(0.6);
  const op2 = useSharedValue(0.4);
  const op3 = useSharedValue(0.2);

  useEffect(() => {
    const dur = 1600;
    ring1.value = withRepeat(withSequence(withTiming(1.45, { duration: dur }), withTiming(1, { duration: dur })), -1);
    op1.value = withRepeat(withSequence(withTiming(0, { duration: dur }), withTiming(0.6, { duration: dur })), -1);
    ring2.value = withDelay(300, withRepeat(withSequence(withTiming(1.45, { duration: dur }), withTiming(1, { duration: dur })), -1));
    op2.value = withDelay(300, withRepeat(withSequence(withTiming(0, { duration: dur }), withTiming(0.4, { duration: dur })), -1));
    ring3.value = withDelay(600, withRepeat(withSequence(withTiming(1.45, { duration: dur }), withTiming(1, { duration: dur })), -1));
    op3.value = withDelay(600, withRepeat(withSequence(withTiming(0, { duration: dur }), withTiming(0.2, { duration: dur })), -1));
  }, []);

  const s1 = useAnimatedStyle(() => ({ transform: [{ scale: ring1.value }], opacity: op1.value }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ scale: ring2.value }], opacity: op2.value }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ scale: ring3.value }], opacity: op3.value }));

  return (
    <View className="items-center justify-center flex-1">
      <View style={{ position: 'relative', width: 160, height: 160, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[s3, { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: colors.primary }]}
        />
        <Animated.View
          style={[s2, { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 1.5, borderColor: colors.primary }]}
        />
        <Animated.View
          style={[s1, { position: 'absolute', width: 102, height: 102, borderRadius: 51, borderWidth: 2, borderColor: colors.primary }]}
        />

        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(34,211,238,0.15)',
            borderWidth: 2,
            borderColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="mic" size={36} color={colors.primary} />
        </View>
      </View>
    </View>
  );
}

function AnalyticsIllustration() {
  const bars = [
    { h: 55, color: colors.primary },
    { h: 90, color: 'rgba(34,211,238,0.75)' },
    { h: 42, color: colors.success },
    { h: 115, color: colors.primary },
    { h: 72, color: 'rgba(34,211,238,0.6)' },
    { h: 98, color: colors.success },
  ];

  return (
    <Animated.View entering={FadeInUp.duration(500)} className="items-center justify-center flex-1 px-4">
      <View
        className="rounded-2xl px-5 pt-4 pb-5 w-full"
        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, maxWidth: 300 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-foreground text-sm font-semibold">Spending</Text>
            <Text className="text-muted-foreground text-xs">This month</Text>
          </View>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 18 }}>$1,240</Text>
        </View>

        <View className="flex-row items-end justify-between" style={{ height: 130, gap: 6 }}>
          {bars.map((bar, i) => (
            <View key={i} className="flex-1 items-center">
              <View style={{ width: '100%', height: bar.h, backgroundColor: bar.color, borderRadius: 6, opacity: 0.9 }} />
            </View>
          ))}
        </View>

        <View className="flex-row justify-between mt-2">
          {['M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} className="flex-1 text-center text-muted-foreground" style={{ fontSize: 10 }}>{d}</Text>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function WalletsIllustration() {
  const wallets = [
    { name: 'Main Card', amount: '$4,200', icon: 'card-outline' as const, accent: colors.primary, bg: 'rgba(34,211,238,0.12)' },
    { name: 'Savings', amount: '$2,400', icon: 'leaf-outline' as const, accent: colors.success, bg: 'rgba(34,197,94,0.12)' },
    { name: 'Cash', amount: '$150', icon: 'cash-outline' as const, accent: '#F97316', bg: 'rgba(249,115,22,0.12)' },
  ];

  return (
    <Animated.View entering={FadeInUp.duration(500)} className="justify-center flex-1 px-2 gap-3">
      {wallets.map((w, i) => (
        <View
          key={i}
          className="flex-row items-center justify-between px-4 py-4 rounded-2xl"
          style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
        >
          <View className="flex-row items-center gap-3">
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: w.bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={w.icon} size={20} color={w.accent} />
            </View>
            <Text className="text-foreground font-semibold text-base">{w.name}</Text>
          </View>
          <Text className="text-foreground font-bold text-base">{w.amount}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

// ─── Slide Dots ───────────────────────────────────────────────────────────────

function SlideDots({ count, current }: { count: number; current: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === current ? colors.primary : colors.border,
          }}
        />
      ))}
    </View>
  );
}

// ─── Slide Data ───────────────────────────────────────────────────────────────

interface SlideData {
  id: string;
  titleKey: string;
  descKey: string;
  Illustration: React.FC;
}

const SLIDES: SlideData[] = [
  { id: 'welcome', titleKey: 'onboarding.slide1Title', descKey: 'onboarding.slide1Desc', Illustration: WelcomeIllustration },
  { id: 'ai-text', titleKey: 'onboarding.slide2Title', descKey: 'onboarding.slide2Desc', Illustration: AiTextIllustration },
  { id: 'ai-voice', titleKey: 'onboarding.slide3Title', descKey: 'onboarding.slide3Desc', Illustration: AiVoiceIllustration },
  { id: 'analytics', titleKey: 'onboarding.slide4Title', descKey: 'onboarding.slide4Desc', Illustration: AnalyticsIllustration },
  { id: 'wallets', titleKey: 'onboarding.slide5Title', descKey: 'onboarding.slide5Desc', Illustration: WalletsIllustration },
];

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProductSlidesProps {
  onNext: () => void;
  onLogin: () => void;
}

export function ProductSlides({ onNext, onLogin }: ProductSlidesProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const goTo = (index: number) => {
    setSlideIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleNext = () => {
    if (slideIndex < SLIDES.length - 1) goTo(slideIndex + 1);
    else onNext();
  };

  const isLastSlide = slideIndex === SLIDES.length - 1;
  const isFirstSlide = slideIndex === 0;

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-6 pt-2 pb-1">
        <View style={{ opacity: isFirstSlide ? 0 : 1, pointerEvents: isFirstSlide ? 'none' : 'auto' }}>
          <Pressable onPress={onNext} hitSlop={12} disabled={isFirstSlide}>
            <Text className="text-muted-foreground text-sm">{t('onboarding.skip')}</Text>
          </Pressable>
        </View>
        <LanguagePicker />
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 px-6">
            <View className="flex-1">
              <item.Illustration />
            </View>
          </View>
        )}
        style={{ flex: 1 }}
      />

      <View className="px-6 pb-10 gap-5">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground text-center">
            {t(SLIDES[slideIndex].titleKey)}
          </Text>
          <Text className="text-base text-muted-foreground text-center leading-6">
            {t(SLIDES[slideIndex].descKey)}
          </Text>
        </View>

        <SlideDots count={SLIDES.length} current={slideIndex} />

        <View className="gap-3">
          <Pressable
            onPress={handleNext}
            className="rounded-2xl py-4 items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="font-semibold text-base" style={{ color: colors.primaryForeground }}>
              {isLastSlide ? t('onboarding.getStarted') : t('onboarding.next')}
            </Text>
          </Pressable>

          {isFirstSlide && (
            <Pressable onPress={onLogin} className="py-3 items-center">
              <Text className="text-muted-foreground text-sm">
                {t('onboarding.haveAccount')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
