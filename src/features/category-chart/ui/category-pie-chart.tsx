import { TransactionType } from '@/shared/constants'
import { useReports } from '@/shared/hooks'
import { CategoryPieChartItem } from '@/shared/types'
import React from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { PieChart } from 'react-native-gifted-charts'

interface CategoryPieChartProps {
  startDate?: string
  endDate?: string
  type?: TransactionType
}

const CategoryPieChart = ({ startDate, endDate, type }: CategoryPieChartProps) => {
  const { getCategoryPieChart } = useReports({ startDate, endDate, type })

  if (getCategoryPieChart.isLoading) {
    return <ActivityIndicator size="large" color="#3b82f6" />
  }

  if (getCategoryPieChart.isError) {
    return (
      <Text className="text-md font-medium text-center text-destructive mb-2">
        Failed to load expenses by category
      </Text>
    )
  }

  const chartData = getCategoryPieChart.data?.data?.data

  if (!chartData || chartData.length === 0) {
    return (
      <Text className="text-md font-medium text-center text-muted-foreground mb-2">
        No expenses found for this period
      </Text>
    )
  }

  const totalValue = chartData.reduce((sum, item) => sum + (item.value || 0), 0)

  const renderLegendItem = (item: CategoryPieChartItem) => {
    const percentage = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : '0.0'
    
    return (
      <View key={item.label} className="flex-row items-center mb-2">
        <View
          style={{
            height: 16,
            width: 16,
            backgroundColor: item.color,
            borderRadius: 8,
            marginRight: 8,
          }}
        />
        <Text className="text-foreground text-sm capitalize flex-1">
          {item.label.toLowerCase()}
        </Text>
        <Text className="text-muted-foreground text-sm font-medium">
          {percentage}%
        </Text>
      </View>
    )
  }

  return (
    <View className="mt-2 w-full items-center">
      <View className="items-center">
        <PieChart
          data={chartData}
          donut
          radius={100}
          innerRadius={60}
          innerCircleColor="#1B0642"
          showValuesAsLabels
          fontWeight="bold"
        />
      </View>

      <ScrollView 
        className="w-full max-h-[120px] pr-2.5"
        showsVerticalScrollIndicator
        nestedScrollEnabled
      >
        {chartData.map(renderLegendItem)}
      </ScrollView>
    </View>
  )
}

export { CategoryPieChart }
