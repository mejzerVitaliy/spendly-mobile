import { useAuth, useProfile } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores';
import { BottomSheet, Button, ConfirmDialog, SettingsHeader } from '@/shared/ui';
import { colors } from '@/shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

// ─── Guest Screen ────────────────────────────────────────────────────────────

function GuestAccountScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-5 py-5">
          <SettingsHeader title={t('account.title')} description={t('account.descriptionGuest')} />

          <View className="rounded-3xl p-5 mb-6 border border-white/[0.08]" style={{ backgroundColor: colors.card }}>
            <View className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(34,211,238,0.12)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.25)' }}
            >
              <Ionicons name="person-outline" size={24} color={colors.primary} />
            </View>
            <Text className="text-[16px] font-bold text-foreground mb-1">{t('account.saveProgress')}</Text>
            <Text className="text-[14px] text-muted-foreground leading-[20px]">
              {t('account.saveProgressDesc')}
            </Text>
          </View>

          <View className="gap-3">
            <Button title={t('account.createAccount')} onPress={() => router.push('/settings/create-account' as any)} />
            <Button title={t('account.signInExisting')} variant="outline" onPress={() => router.push('/settings/login' as any)} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export function AccountScreen() {
  const { user } = useAuthStore();
  const { logoutMutation } = useAuth();
  const { updateEmailMutation, changePasswordMutation, deleteAccountMutation } = useProfile();
  const { t } = useTranslation();

  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user || user.type === 'GUEST') return <GuestAccountScreen />;

  const initials = user.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  const handleOpenEditEmail = () => {
    setNewEmail(user.email ?? '');
    setShowEditEmail(true);
  };

  const handleSaveEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      Toast.show({ type: 'error', text1: t('account.emailInvalid'), text2: t('account.emailInvalidDesc') });
      return;
    }
    try {
      await updateEmailMutation.mutateAsync({ email: newEmail.trim().toLowerCase() });
      setShowEditEmail(false);
      Toast.show({ type: 'success', text1: t('account.emailUpdated') });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: e?.response?.data?.message ?? t('account.failedUpdateEmail') });
    }
  };

  const handleOpenChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowChangePassword(true);
  };

  const handleSavePassword = async () => {
    if (!currentPassword) {
      Toast.show({ type: 'error', text1: t('account.currentPasswordRequired'), text2: t('account.currentPasswordRequiredDesc') });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: t('account.passwordTooShort'), text2: t('account.passwordTooShortDesc') });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: t('account.passwordMismatch'), text2: t('account.passwordMismatchDesc') });
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setShowChangePassword(false);
      Toast.show({ type: 'success', text1: t('account.passwordChanged') });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: e?.response?.data?.message ?? t('account.failedChangePassword') });
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logoutMutation.mutateAsync();
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteAccountMutation.mutateAsync();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: e?.response?.data?.message ?? t('account.failedDelete') });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-5">
          <SettingsHeader title={t('account.title')} description={t('account.descriptionRegistered')} />

          <View className="items-center py-6 mb-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: 'rgba(34,211,238,0.15)', borderWidth: 2, borderColor: 'rgba(34,211,238,0.35)' }}
            >
              <Text className="text-[28px] font-bold" style={{ color: colors.primary }}>{initials}</Text>
            </View>
            <Text className="text-[17px] font-bold text-foreground">{user.email}</Text>
            <View
              className="flex-row items-center gap-1.5 mt-2 px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(34,211,238,0.1)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.2)' }}
            >
              <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
              <Text className="text-[11px] font-semibold" style={{ color: colors.primary }}>{t('account.registered')}</Text>
            </View>
          </View>

          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            {t('account.sectionAccount')}
          </Text>
          <View className="rounded-3xl overflow-hidden mb-5" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}>
            <ActionRow icon="mail-outline" label={t('account.editEmail')} onPress={handleOpenEditEmail} />
            <View className="h-px bg-border" />
            <ActionRow icon="lock-closed-outline" label={t('account.changePassword')} onPress={handleOpenChangePassword} />
          </View>

          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            {t('account.sectionSession')}
          </Text>
          <View className="rounded-3xl overflow-hidden mb-5" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}>
            <ActionRow
              icon="log-out-outline"
              label={t('account.logOut')}
              onPress={() => setShowLogoutConfirm(true)}
              loading={logoutMutation.isPending}
            />
          </View>

          <Text className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(239,68,68,0.7)' }}>
            {t('account.dangerZone')}
          </Text>
          <View className="rounded-3xl overflow-hidden" style={{ backgroundColor: 'rgba(239,68,68,0.05)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)' }}>
            <ActionRow
              icon="trash-outline"
              label={t('account.deleteAccount')}
              destructive
              onPress={() => setShowDeleteConfirm(true)}
              loading={deleteAccountMutation.isPending}
            />
          </View>

          <Text className="text-[12px] text-muted-foreground text-center mt-4 leading-[18px]">
            {t('account.deleteAccountDesc')}
          </Text>

          <View className="h-8" />
        </View>
      </ScrollView>

      {/* Edit Email Bottom Sheet */}
      <BottomSheet
        open={showEditEmail}
        onOpenChange={(open) => { if (!open) setShowEditEmail(false); }}
        noWrapper
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-1.5 pb-10">
            <View className="flex-row justify-between items-center mb-7">
              <Text className="text-[20px] font-bold text-foreground">{t('account.editEmail')}</Text>
              <Pressable
                onPress={() => setShowEditEmail(false)}
                className="w-8 h-8 rounded-full bg-secondary border border-white/10 items-center justify-center active:opacity-70"
              >
                <Ionicons name="close" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <Text className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
              {t('account.newEmailAddress')}
            </Text>
            <BottomSheetTextInput
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              style={{
                backgroundColor: colors.input,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: colors.foreground,
                marginBottom: 24,
              }}
            />

            <Pressable
              onPress={handleSaveEmail}
              disabled={updateEmailMutation.isPending}
              className="bg-primary rounded-[18px] items-center py-[17px] active:opacity-75"
              style={{ opacity: updateEmailMutation.isPending ? 0.7 : 1 }}
            >
              {updateEmailMutation.isPending
                ? <ActivityIndicator size="small" color={colors.primaryForeground} />
                : <Text className="text-[16px] font-bold text-primary-foreground">{t('account.saveEmail')}</Text>
              }
            </Pressable>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Change Password Bottom Sheet */}
      <BottomSheet
        open={showChangePassword}
        onOpenChange={(open) => { if (!open) setShowChangePassword(false); }}
        noWrapper
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-1.5 pb-10">
            <View className="flex-row justify-between items-center mb-7">
              <Text className="text-[20px] font-bold text-foreground">{t('account.changePassword')}</Text>
              <Pressable
                onPress={() => setShowChangePassword(false)}
                className="w-8 h-8 rounded-full bg-secondary border border-white/10 items-center justify-center active:opacity-70"
              >
                <Ionicons name="close" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <SheetPasswordField label={t('account.currentPassword')} value={currentPassword} onChange={setCurrentPassword} />
            <SheetPasswordField label={t('account.newPassword')} value={newPassword} onChange={setNewPassword} hint={t('account.minSixChars')} />
            <SheetPasswordField label={t('account.confirmNewPassword')} value={confirmPassword} onChange={setConfirmPassword} returnKeyType="done" extraMargin />

            <Pressable
              onPress={handleSavePassword}
              disabled={changePasswordMutation.isPending}
              className="bg-primary rounded-[18px] items-center py-[17px] active:opacity-75"
              style={{ opacity: changePasswordMutation.isPending ? 0.7 : 1 }}
            >
              {changePasswordMutation.isPending
                ? <ActivityIndicator size="small" color={colors.primaryForeground} />
                : <Text className="text-[16px] font-bold text-primary-foreground">{t('account.changePasswordBtn')}</Text>
              }
            </Pressable>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      <ConfirmDialog
        visible={showLogoutConfirm}
        title={t('account.logoutConfirmTitle')}
        message={t('account.logoutConfirmMessage')}
        confirmText={t('account.logOut')}
        cancelText={t('common.cancel')}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmDialog
        visible={showDeleteConfirm}
        title={t('account.deleteConfirmTitle')}
        message={t('account.deleteConfirmMessage')}
        confirmText={t('account.deleteAccount')}
        cancelText={t('common.cancel')}
        destructive
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ActionRow({
  icon,
  label,
  onPress,
  destructive = false,
  loading = false,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  destructive?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className="flex-row items-center px-4 py-4 gap-3 active:opacity-60"
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center ${destructive ? 'bg-red-500/[0.12] border border-red-500/[0.25]' : 'bg-white/[0.05] border border-white/[0.08]'}`}
      >
        {loading
          ? <ActivityIndicator size="small" color={destructive ? colors.destructive : colors.mutedForeground} />
          : <Ionicons name={icon} size={20} color={destructive ? colors.destructive : colors.mutedForeground} />
        }
      </View>
      <Text
        className="flex-1 text-[15px] font-semibold"
        style={{ color: destructive ? colors.destructive : colors.foreground }}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={destructive ? 'rgba(239,68,68,0.5)' : colors.mutedForeground} />
    </Pressable>
  );
}

function SheetPasswordField({
  label,
  value,
  onChange,
  hint,
  returnKeyType = 'next',
  extraMargin = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  returnKeyType?: 'next' | 'done';
  extraMargin?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ marginBottom: extraMargin ? 24 : 16 }}>
      <Text className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
        {label}
      </Text>
      <View style={{ position: 'relative' }}>
        <BottomSheetTextInput
          value={value}
          onChangeText={onChange}
          placeholder="••••••••"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={!visible}
          returnKeyType={returnKeyType}
          style={{
            backgroundColor: colors.input,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
            paddingRight: 48,
            fontSize: 16,
            color: colors.foreground,
          }}
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={8}
          style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
        >
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.mutedForeground}
          />
        </Pressable>
      </View>
      {hint && (
        <Text className="text-[11px] text-muted-foreground mt-1.5 ml-1">{hint}</Text>
      )}
    </View>
  );
}
