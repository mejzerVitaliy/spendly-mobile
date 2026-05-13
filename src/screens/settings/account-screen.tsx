import { SettingsHeader, Input, Button, Separator } from '@/shared/ui';
import { useAuthStore } from '@/shared/stores';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { colors } from '@/shared/theme';

function InfoCard({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.infoCard}>
        <BlurView intensity={30} tint="systemUltraThinMaterialDark" style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.glass.background, borderRadius: 18 }]} />
        <View style={[StyleSheet.absoluteFillObject, { borderRadius: 18, borderWidth: 1, borderColor: colors.glass.border }]} />
        <View style={styles.infoCardInner}>{children}</View>
      </View>
    );
  }
  return (
    <View style={[styles.infoCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
      <View style={styles.infoCardInner}>{children}</View>
    </View>
  );
}

export function AccountScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const isGuest = user?.type === 'GUEST';

  if (isGuest) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.content}>
            <SettingsHeader title="Account" description="You are using a guest account" />

            <InfoCard>
              <Text style={styles.infoText}>
                Create an account to secure your data and access it from any device.
              </Text>
              <Text style={[styles.infoText, { color: colors.mutedForeground, fontSize: 13, marginTop: 4 }]}>
                All your current data will be preserved.
              </Text>
            </InfoCard>

            <View style={{ gap: 12, marginTop: 8 }}>
              <Button
                title="Create Account"
                onPress={() => router.push('/settings/create-account' as any)}
              />
              <Button
                title="Login to Existing Account"
                variant="outline"
                onPress={() => router.push('/settings/login' as any)}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.content}>
          <SettingsHeader title="Account" description="Manage your personal information" />

          <Text style={styles.sectionLabel}>Personal Information</Text>

          <View style={{ marginBottom: 16 }}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={user?.email ?? ''}
              keyboardType="email-address"
              disabled
            />
          </View>

          <Separator style={{ marginVertical: 20 }} />

          <Text style={styles.sectionLabel}>Profile Picture</Text>

          <Button
            title="Upload Photo"
            variant="outline"
            onPress={() => {}}
          />

          <View style={{ height: 16 }} />

          <Button
            title="Save Changes"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
  },
  infoCardInner: {
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.foreground,
    lineHeight: 20,
  },
});
