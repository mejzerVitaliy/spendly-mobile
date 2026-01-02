import { RegisterForm } from '@/features/auth';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-8">
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground mb-2">
              Create an account
            </Text>
            <Text className="text-muted-foreground">
              Fill in the registration data
            </Text>
          </View>

          <RegisterForm />

          <View className="mt-6 flex-row justify-center items-center">
            <Text className="text-muted-foreground">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-semibold">
                Log in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
