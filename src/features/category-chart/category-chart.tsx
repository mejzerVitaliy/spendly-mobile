import { ChartType, TransactionType } from '@/shared/constants'
import { useAnalyticsStore } from '@/shared/stores'
import { Card, IconSwitch } from '@/shared/ui'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { CategoryBarChart, CategoryPieChart } from './ui'

interface CategoryChartProps {
  startDate?: string
  endDate?: string
}

const CategoryChart = (props: CategoryChartProps) => {
  const { selectedCategoryChartType, selectedCategoryTransactionType, setSelectedCategoryChartType, setSelectedCategoryTransactionType } = useAnalyticsStore()

  const toggleTransactionType = () => {
    setSelectedCategoryTransactionType(
      selectedCategoryTransactionType === TransactionType.EXPENSE
        ? TransactionType.INCOME
        : TransactionType.EXPENSE
    )
  }

  return (
    <Card>
      <View className="flex flex-row items-center justify-between mb-4">
        <Pressable 
          onPress={toggleTransactionType}
          className="flex-row items-center gap-2 active:opacity-70"
        >
          <Text className="text-md font-semibold text-foreground mb-1">
            {selectedCategoryTransactionType === TransactionType.EXPENSE
              ? 'Expenses by category'
              : 'Incomes by category'
            }
          </Text>
          <MaterialCommunityIcons 
            name="swap-vertical" 
            size={20} 
            color="#6b7280"
          />
        </Pressable>

        <IconSwitch
          value={selectedCategoryChartType}
          options={[
            { value: ChartType.BAR, icon: 'chart-bar' },
            { value: ChartType.PIE, icon: 'chart-pie' },
          ]}
          onChange={setSelectedCategoryChartType}
        />
      </View>

      {selectedCategoryChartType === ChartType.BAR
        ? <CategoryBarChart {...props} type={selectedCategoryTransactionType} />
        : <CategoryPieChart {...props} type={selectedCategoryTransactionType} />
      }
    </Card>
  )
}

export { CategoryChart }
