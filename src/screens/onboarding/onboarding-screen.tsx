import { useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore, useAuthStore } from '@/shared/stores';
import { authApi } from '@/shared/services/api/auth.api';
import { ProductSlides } from './slides/product-slides';
import { CategoriesStep } from './steps/categories-step';
import { CurrencyStep } from './steps/currency-step';
import { WalletStep } from './steps/wallet-step';
import { ReadyStep } from './steps/ready-step';
import { useTranslation } from 'react-i18next';

// Steps: 0=product slides, 1=categories, 2=currency, 3=wallet, 4=ready
const SETUP_STEPS = 3;

export function OnboardingScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

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
    setPendingOpenCreate,
    setHasSeenCoach,
  } = useOnboardingStore();

  const { setAuth } = useAuthStore();

  const handleFinish = async (openCreate: boolean) => {
    setIsSubmitting(true);
    try {
      const response = await authApi.guest({
        mainCurrencyCode,
        favoriteCategories,
        walletInitialBalance: walletInitialBalance * 100,
      });

      const { user, accessToken, refreshToken } = response.data;

      setHasSeenCoach(false); // reset so coach shows for every new account
      if (openCreate) setPendingOpenCreate(true);

      await setAuth(user, accessToken, refreshToken);

      setCompleted(true);
    } catch {
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('onboarding.somethingWentWrong') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSetupStep = step >= 1 && step <= 3;
  const setupProgress = step - 1;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {isSetupStep && (
        <View className="flex-row px-6 pt-4 pb-2 gap-2">
          {Array.from({ length: SETUP_STEPS }).map((_, i) => (
            <View
              key={i}
              className={`flex-1 h-1 rounded-full ${i <= setupProgress ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </View>
      )}

      {step === 0 && (
        <ProductSlides
          onNext={nextStep}
          onLogin={() => router.push('/(onboarding)/login' as any)}
        />
      )}

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
          onFinish={nextStep}
          onBack={prevStep}
          isLoading={false}
        />
      )}

      {step === 4 && (
        <ReadyStep
          onCreateFirst={() => handleFinish(true)}
          isLoading={isSubmitting}
        />
      )}
    </SafeAreaView>
  );
}
