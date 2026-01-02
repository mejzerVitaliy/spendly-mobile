import { LoginForm } from '@/features/auth';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground mb-2">
              Welcome To Spendly!
            </Text>
            <Text className="text-muted-foreground">
              Log in to your account
            </Text>
          </View>

          <LoginForm />

          <View className="mt-6 flex-row justify-center items-center">
            <Text className="text-muted-foreground">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="text-primary font-semibold">
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
