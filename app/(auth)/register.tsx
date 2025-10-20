import { View, Text, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { RegisterForm } from '@/features/auth';

export default function RegisterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-8">
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Создать аккаунт
            </Text>
            <Text className="text-gray-600">
              Заполните данные для регистрации
            </Text>
          </View>

          <RegisterForm />

          <View className="mt-6 flex-row justify-center items-center">
            <Text className="text-gray-600">Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-blue-500 font-semibold">
                Войти
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
