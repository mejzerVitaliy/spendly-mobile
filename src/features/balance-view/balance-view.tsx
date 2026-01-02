import { useReportsSummary } from '@/shared/hooks'
import { Card } from '@/shared/ui'
import React from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

const BalanceView = () => {
  const { data, isLoading, isError } = useReportsSummary()

  if (isLoading) {
    return (
      <View className="py-8 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  if (isError) {
    return (
      <View className="py-8 items-center justify-center">
        <Text className="text-destructive text-center">
          Failed to load balance data
        </Text>
      </View>
    )
  }

  const totalBalance = data?.data?.totalBalance ?? 0
  const totalIncome = data?.data?.totalIncome ?? 0
  const totalExpenses = data?.data?.totalExpense ?? 0

  return (
    <View>
      <Card className="mb-4">
        <Text className="text-lg font-semibold text-foreground mb-2">Balance</Text>
        <Text className="text-3xl font-bold text-primary">
          ${totalBalance.toFixed(2)}
        </Text>
      </Card>

      <View className="flex-row gap-3">
        <Card className="flex-1">
          <Text className="text-sm text-muted-foreground">Income</Text>
          <Text className="text-xl font-bold text-success">${totalIncome.toFixed(2)}</Text>
        </Card>
        <Card className="flex-1">
          <Text className="text-sm text-muted-foreground">Expenses</Text>
          <Text className="text-xl font-bold text-destructive">${totalExpenses.toFixed(2)}</Text>
        </Card>
      </View>
    </View>
  )
}

export { BalanceView }
