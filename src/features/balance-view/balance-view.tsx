import { useAuth, useReports, useWallets } from '@/shared/hooks'
import { Card } from '@/shared/ui'
import React from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

interface BalanceViewProps {
  startDate?: string
  endDate?: string
}

const BalanceView = ({ startDate, endDate }: BalanceViewProps) => {
  const { getSummary } = useReports({ startDate, endDate })
  const { totalBalance: walletTotalBalance, isLoading: isWalletsLoading } = useWallets()
  const { getMeQuery } = useAuth()

  if (getSummary.isLoading || isWalletsLoading) {
    return (
      <View className="py-8 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  if (getSummary.isError) {
    return (
      <View className="py-8 items-center justify-center">
        <Text className="text-destructive text-center">
          Failed to load balance data
        </Text>
      </View>
    )
  }

  const data = getSummary?.data?.data

  const totalBalance = walletTotalBalance?.totalBalance ?? 0
  const totalIncome = data?.totalIncome ?? 0
  const totalExpenses = data?.totalExpense ?? 0
  const mainCurrencyCode = getMeQuery?.data?.data?.mainCurrencyCode ?? 'USD'

  return (
    <View>
      <Card className="mb-4">
        <Text className="text-lg font-semibold text-foreground mb-2">Balance</Text>
        <Text className="text-3xl font-bold text-primary">
          {(totalBalance / 100).toFixed(2)} {mainCurrencyCode}
        </Text>
      </Card>

      <View className="flex-row gap-3">
        <Card className="flex-1">
          <Text className="text-sm text-muted-foreground">Income</Text>
          <Text className="text-lg font-bold text-success">{(totalIncome / 100).toFixed(2)} {mainCurrencyCode}</Text>
        </Card>
        <Card className="flex-1">
          <Text className="text-sm text-muted-foreground">Expenses</Text>
          <Text className="text-lg font-bold text-destructive">{(totalExpenses / 100).toFixed(2)} {mainCurrencyCode}</Text>
        </Card>
      </View>
    </View>
  )
}

export { BalanceView }
