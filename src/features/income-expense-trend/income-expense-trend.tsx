import { useReports } from "@/shared/hooks";
import { Card } from "@/shared/ui";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

interface IncomeExpenseTrendProps {
  startDate?: string;
  endDate?: string;
}

const IncomeExpenseTrend = (props: IncomeExpenseTrendProps) => {
  const { getIncomesExpensesTrendChart } = useReports({ ...props });

  if (getIncomesExpensesTrendChart.isLoading) {
    return <ActivityIndicator size="large" color="#3b82f6" />;
  }

  if (getIncomesExpensesTrendChart.isError) {
    return (
      <Text className="text-md font-medium text-center text-destructive mb-2">
        Failed to load expenses by category
      </Text>
    );
  }

  const expensesLine = getIncomesExpensesTrendChart.data?.data?.expenses;
  const incomesLine = getIncomesExpensesTrendChart.data?.data?.incomes;

  if (!expensesLine || !incomesLine || expensesLine.length === 0 || incomesLine.length === 0) {
    return (
      <Text className="text-md font-medium text-center text-muted-foreground mb-2">
        No expenses found for this period
      </Text>
    );
  }

  const maxValue = Math.max(
    ...expensesLine.map(item => item.value || 0), 
    ...incomesLine.map(item => item.value || 0),
    0
  );

  return (
    <Card>
      <View className="flex flex-row items-center justify-between mb-4">
        <Text className="text-md font-semibold text-foreground">
          Expenses vs. Incomes
        </Text>
      </View>

      <View>
        <LineChart
          width={265}
          data={incomesLine}
          data2={expensesLine}
          height={200}
          spacing={50}
          endSpacing={0}
          stepValue={maxValue ? (maxValue + 150) / 5 : 30}
          maxValue={maxValue + 150}
          initialSpacing={30}
          color1="green"
          color2="red"
          textColor1="green"
          textColor2="red"
          dataPointsHeight={6}
          dataPointsWidth={6}
          dataPointsColor1="green"
          dataPointsColor2="red"
          textShiftY={-2}
          textShiftX={-5}
          textFontSize={13}
          labelsExtraHeight={10}
          yAxisTextStyle={{
            color: '#9ca3af',
            fontSize: 10,
            fontWeight: '500',
          }}
          yAxisLabelPrefix='$'
          yAxisLabelContainerStyle={{
            width: 44,
          }}
          yAxisLabelWidth={50}
          xAxisLabelTextStyle={{
            color: 'white',
            fontSize: 7,
            fontWeight: '500',
            // transform: [{ rotate: '25deg' }],
            // marginTop: 8,
          }}
          rulesType="solid"
          rulesColor="rgba(255, 255, 255, 0.1)"
          showVerticalLines
          verticalLinesColor="rgba(255, 255, 255, 0.05)"
          isAnimated
          yAxisThickness={0}
          xAxisThickness={0}
        />
      </View>
    </Card>
  );
};

export { IncomeExpenseTrend };
