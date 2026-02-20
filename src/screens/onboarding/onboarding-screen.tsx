import { useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore , useAuthStore } from '@/shared/stores';
import { authApi } from '@/shared/services/api/auth.api';
import { WelcomeStep } from './steps/welcome-step';
import { CategoriesStep } from './steps/categories-step';
import { CurrencyStep } from './steps/currency-step';
import { WalletStep } from './steps/wallet-step';

const TOTAL_STEPS = 4;

export function OnboardingScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    step,
    mainCurrencyCode,
    favoriteCategories,
    walletInitialBalance,
    nextStep,
    prevStep,
    setMainCurrencyCode,
    setFavoriteCategories,
    setWalletInitialBalance,
    setCompleted,
  } = useOnboardingStore();

  const { setAuth } = useAuthStore();

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const response = await authApi.guest({
        mainCurrencyCode,
        favoriteCategories,
        walletInitialBalance: walletInitialBalance * 100,
      });

      const { user, accessToken, refreshToken } = response.data;
      
      await setAuth(user, accessToken, refreshToken);
      
      setCompleted(true);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row px-6 pt-4 gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            className={`flex-1 h-1 rounded-full ${
              i <= step ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </View>

      {step === 0 && <WelcomeStep onNext={nextStep} onLogin={() => router.push('/(onboarding)/login' as any)} />}

      {step === 1 && (
        <CategoriesStep
          selected={favoriteCategories}
          onSelect={setFavoriteCategories}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {step === 2 && (
        <CurrencyStep
          selected={mainCurrencyCode}
          onSelect={setMainCurrencyCode}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {step === 3 && (
        <WalletStep
          initialBalance={walletInitialBalance}
          onSetBalance={setWalletInitialBalance}
          onFinish={handleFinish}
          onBack={prevStep}
          isLoading={isSubmitting}
        />
      )}
    </SafeAreaView>
  );
}
