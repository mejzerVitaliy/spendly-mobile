import { View, Text, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LoginForm } from '@/features/auth';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Добро пожаловать!
            </Text>
            <Text className="text-gray-600">
              Войдите в свой аккаунт
            </Text>
          </View>

          <LoginForm />

          <View className="mt-6 flex-row justify-center items-center">
            <Text className="text-gray-600">Нет аккаунта? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="text-blue-500 font-semibold">
                Зарегистрироваться
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
