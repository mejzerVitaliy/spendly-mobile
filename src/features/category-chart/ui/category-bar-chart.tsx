import { TransactionType } from '@/shared/constants'
import { useReports } from '@/shared/hooks'
import { CategoryBarChartItem, CategoryChartItem } from '@/shared/types'
import React from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { BarChart } from 'react-native-gifted-charts'
import { colors } from '@/shared/theme'

interface CategoryBarChartProps {
  startDate?: string
  endDate?: string
  type?: TransactionType
}

const CategoryBarChart = ({ startDate, endDate, type }: CategoryBarChartProps) => {
  const { getCategoryChart } = useReports({ startDate, endDate, type })

  if (getCategoryChart.isLoading) {
    return <ActivityIndicator size="large" color={colors.primary} />
  }

  if (getCategoryChart.isError) {
    return (
      <Text className="text-md font-medium text-center text-destructive mb-2">
        Failed to load expenses by category
      </Text>
    )
  }

  const chartData = getCategoryChart.data?.data?.data

  if (!chartData || chartData.length === 0) {
    return (
      <Text className="text-md font-medium text-center text-muted-foreground mb-2">
        No expenses found for this period
      </Text>
    )
  }

  const maxValue = Math.max(...chartData.map((item: CategoryChartItem) => item.value || 0), 0)

  return (
      <View className="mt-2 w-full max-w-full">
        <BarChart
          width={270}
          data={chartData}
          barWidth={40}
          barBorderRadius={8}
          spacing={20}
          noOfSections={3}
          stepValue={maxValue ? (maxValue + 150) / 5 : 30}
          maxValue={maxValue + 150}
          yAxisThickness={0}
          xAxisThickness={0}
          showYAxisIndices={false}
          yAxisTextStyle={{
            color: colors.mutedForeground,
            fontSize: 10,
            fontWeight: '500',
          }}
          yAxisLabelContainerStyle={{
            width: 44,
          }}
          yAxisLabelWidth={50}
          yAxisLabelPrefix='$'
          xAxisLabelTextStyle={{
            color: colors.mutedForeground,
            fontSize: 8,
            fontWeight: '500',
            transform: [{ rotate: '20deg' }],
          }}
          rulesType="solid"
          rulesColor="rgba(255, 255, 255, 0.1)"
          showVerticalLines
          verticalLinesColor="rgba(255, 255, 255, 0.05)"
          isAnimated
          initialSpacing={20}
          endSpacing={0}
          autoCenterTooltip
          renderTooltip={(item: CategoryBarChartItem) => {
            return (
              <View className="bg-background border border-border rounded px-2 py-1 flex flex-col items-center">
                <Text className="text-foreground text-xs font-semibold">
                  {item.label}
                </Text>
                
                <Text className="text-foreground text-xs font-semibold">
                  ${item.value.toFixed(2)}
                </Text>
              </View>
            )
          } }
        />
      </View>
  )
}

export {CategoryBarChart}