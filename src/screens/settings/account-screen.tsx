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

// ─── Guest Screen ────────────────────────────────────────────────────────────

function GuestAccountScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-5 py-5">
          <SettingsHeader title="Account" description="You are currently using a guest account" />

          <View className="rounded-3xl p-5 mb-6 border border-white/[0.08]" style={{ backgroundColor: colors.card }}>
            <View className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(34,211,238,0.12)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.25)' }}
            >
              <Ionicons name="person-outline" size={24} color={colors.primary} />
            </View>
            <Text className="text-[16px] font-bold text-foreground mb-1">Save your progress</Text>
            <Text className="text-[14px] text-muted-foreground leading-[20px]">
              Create an account to back up your data and access it from any device. All your current data will be preserved.
            </Text>
          </View>

          <View className="gap-3">
            <Button title="Create Account" onPress={() => router.push('/settings/create-account' as any)} />
            <Button title="Sign in to Existing Account" variant="outline" onPress={() => router.push('/settings/login' as any)} />
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

  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit email form
  const [newEmail, setNewEmail] = useState('');
  // Change password form
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
      Toast.show({ type: 'error', text1: 'Invalid email', text2: 'Please enter a valid email address' });
      return;
    }
    try {
      await updateEmailMutation.mutateAsync({ email: newEmail.trim().toLowerCase() });
      setShowEditEmail(false);
      Toast.show({ type: 'success', text1: 'Email updated' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.response?.data?.message ?? 'Failed to update email' });
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
      Toast.show({ type: 'error', text1: 'Required', text2: 'Enter your current password' });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Too short', text2: 'New password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Mismatch', text2: 'Passwords do not match' });
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setShowChangePassword(false);
      Toast.show({ type: 'success', text1: 'Password changed' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e?.response?.data?.message ?? 'Failed to change password' });
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
      Toast.show({ type: 'error', text1: 'Error', text2: e?.response?.data?.message ?? 'Failed to delete account' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-5">
          <SettingsHeader title="Account" description="Manage your personal information and security" />

          {/* Avatar + email hero */}
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
              <Text className="text-[11px] font-semibold" style={{ color: colors.primary }}>Registered</Text>
            </View>
          </View>

          {/* Account actions */}
          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Account
          </Text>
          <View className="rounded-3xl overflow-hidden mb-5" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}>
            <ActionRow
              icon="mail-outline"
              label="Edit Email"
              onPress={handleOpenEditEmail}
            />
            <View style={{ height: 1, backgroundColor: colors.glass.border, marginLeft: 56 }} />
            <ActionRow
              icon="lock-closed-outline"
              label="Change Password"
              onPress={handleOpenChangePassword}
            />
          </View>

          {/* Session */}
          <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Session
          </Text>
          <View className="rounded-3xl overflow-hidden mb-5" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glass.border }}>
            <ActionRow
              icon="log-out-outline"
              label="Log Out"
              onPress={() => setShowLogoutConfirm(true)}
              loading={logoutMutation.isPending}
            />
          </View>

          {/* Danger zone */}
          <Text className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(239,68,68,0.7)' }}>
            Danger Zone
          </Text>
          <View className="rounded-3xl overflow-hidden" style={{ backgroundColor: 'rgba(239,68,68,0.05)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)' }}>
            <ActionRow
              icon="trash-outline"
              label="Delete Account"
              destructive
              onPress={() => setShowDeleteConfirm(true)}
              loading={deleteAccountMutation.isPending}
            />
          </View>

          <Text className="text-[12px] text-muted-foreground text-center mt-4 leading-[18px]">
            Deleting your account is permanent and cannot be undone.{'\n'}All your data will be removed.
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
              <Text className="text-[20px] font-bold text-foreground">Edit Email</Text>
              <Pressable
                onPress={() => setShowEditEmail(false)}
                className="w-8 h-8 rounded-full bg-secondary border border-white/10 items-center justify-center active:opacity-70"
              >
                <Ionicons name="close" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <Text className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
              New Email Address
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
                : <Text className="text-[16px] font-bold text-primary-foreground">Save Email</Text>
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
              <Text className="text-[20px] font-bold text-foreground">Change Password</Text>
              <Pressable
                onPress={() => setShowChangePassword(false)}
                className="w-8 h-8 rounded-full bg-secondary border border-white/10 items-center justify-center active:opacity-70"
              >
                <Ionicons name="close" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <SheetPasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
            <SheetPasswordField label="New Password" value={newPassword} onChange={setNewPassword} hint="Minimum 6 characters" />
            <SheetPasswordField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} returnKeyType="done" extraMargin />

            <Pressable
              onPress={handleSavePassword}
              disabled={changePasswordMutation.isPending}
              className="bg-primary rounded-[18px] items-center py-[17px] active:opacity-75"
              style={{ opacity: changePasswordMutation.isPending ? 0.7 : 1 }}
            >
              {changePasswordMutation.isPending
                ? <ActivityIndicator size="small" color={colors.primaryForeground} />
                : <Text className="text-[16px] font-bold text-primary-foreground">Change Password</Text>
              }
            </Pressable>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Logout Confirm */}
      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Delete Account Confirm */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Account"
        message="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmText="Delete Account"
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
        className="w-9 h-9 rounded-2xl items-center justify-center"
        style={{
          backgroundColor: destructive ? 'rgba(239,68,68,0.12)' : colors.glass.background,
          borderWidth: 1,
          borderColor: destructive ? 'rgba(239,68,68,0.25)' : colors.glass.border,
        }}
      >
        {loading
          ? <ActivityIndicator size="small" color={destructive ? colors.destructive : colors.mutedForeground} />
          : <Ionicons name={icon} size={18} color={destructive ? colors.destructive : colors.mutedForeground} />
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
