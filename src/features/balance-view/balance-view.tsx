import { useAuth, useReports, useWallets } from '@/shared/hooks'
import { formatCompact } from '@/shared/utils'
import { Ionicons } from '@expo/vector-icons'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

interface BalanceViewProps {
  startDate?: string
  endDate?: string
}

function SkeletonBlock({ className }: { className?: string }) {
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
      false,
    )
  }, [opacity])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View className={`bg-muted rounded-lg ${className}`} style={style} />
  )
}

function StatCard({
  label,
  amount,
  currency,
  icon,
  color,
  isLoading,
}: {
  label: string
  amount: number
  currency: string
  icon: keyof typeof Ionicons.glyphMap
  color: string
  isLoading: boolean
}) {
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (!isLoading) {
      opacity.value = withTiming(1, { duration: 400 })
    } else {
      opacity.value = 0
    }
  }, [isLoading, opacity])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <View className="flex-1 bg-card rounded-2xl p-4 border border-border">
      <View className="flex-row items-center gap-2 mb-2">
        <View
          className="w-7 h-7 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={14} color={color} />
        </View>
        <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
      </View>
      {isLoading ? (
        <SkeletonBlock className="h-6 w-24 mt-1" />
      ) : (
        <Animated.Text
          className="text-lg font-bold"
          style={[{ color }, style]}
        >
          {formatCompact(amount)}{' '}
          <Text className="text-sm font-medium text-muted-foreground">{currency}</Text>
        </Animated.Text>
      )}
    </View>
  )
}

const BalanceView = ({ startDate, endDate }: BalanceViewProps) => {
  const { getSummary } = useReports({ startDate, endDate })
  const { totalBalance: walletTotalBalance, isLoading: isWalletsLoading } = useWallets()
  const { getMeQuery } = useAuth()

  const isLoading = getSummary.isLoading || isWalletsLoading

  const data = getSummary?.data?.data
  const totalBalance = walletTotalBalance?.totalBalance ?? 0
  const totalIncome = data?.totalIncome ?? 0
  const totalExpenses = data?.totalExpense ?? 0
  const mainCurrencyCode = getMeQuery?.data?.data?.mainCurrencyCode ?? 'USD'

  const balanceOpacity = useSharedValue(0)

  useEffect(() => {
    if (!isLoading) {
      balanceOpacity.value = withTiming(1, { duration: 500 })
    } else {
      balanceOpacity.value = 0
    }
  }, [isLoading, balanceOpacity])

  const balanceStyle = useAnimatedStyle(() => ({ opacity: balanceOpacity.value }))

  return (
    <View className="mb-4">
      <View className="bg-card rounded-2xl p-5 mb-3 border border-border">
        <Text className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-widest">
          Total Balance
        </Text>
        {isLoading ? (
          <SkeletonBlock className="h-10 w-48 mt-1" />
        ) : (
          <Animated.Text
            className="text-4xl font-bold text-primary"
            style={balanceStyle}
          >
            {formatCompact(totalBalance)}{' '}
            <Text className="text-xl font-semibold text-muted-foreground">{mainCurrencyCode}</Text>
          </Animated.Text>
        )}
      </View>

      <View className="flex-row gap-3">
        <StatCard
          label="Income"
          amount={totalIncome}
          currency={mainCurrencyCode}
          icon="arrow-down-circle"
          color="#22C55E"
          isLoading={isLoading}
        />
        <StatCard
          label="Expenses"
          amount={totalExpenses}
          currency={mainCurrencyCode}
          icon="arrow-up-circle"
          color="#EF4444"
          isLoading={isLoading}
        />
      </View>
    </View>
  )
}

export { BalanceView }
