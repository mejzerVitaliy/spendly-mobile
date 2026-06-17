import React, { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { useReports } from "@/shared/hooks";
import { TrendPoint } from "@/shared/types";
import { Card } from "@/shared/ui";
import { colors } from "@/shared/theme";

interface BalanceTrendProps {
  startDate?: string;
  endDate?: string;
}

const BalanceTrend = ({ startDate, endDate }: BalanceTrendProps) => {
  const { getCashFlowTrend } = useReports({ startDate, endDate });

  const incomesData = getCashFlowTrend.data?.data?.incomes;
  const expensesData = getCashFlowTrend.data?.data?.expenses;

  const { adjustedMaxValue, adjustedMinValue } = useMemo(() => {
    if (!incomesData || !expensesData || incomesData.length === 0) {
      return { adjustedMaxValue: 150, adjustedMinValue: -150 };
    }

    const maxValue = Math.max(
      ...incomesData.map((item: TrendPoint) => item.value || 0),
      0,
    );
    const minValue = Math.min(
      ...expensesData.map((item: TrendPoint) => -(item.value || 0)),
      0,
    );

    return {
      adjustedMaxValue: Math.max(maxValue + 150, 150),
      adjustedMinValue: Math.min(minValue - 150, -150),
    };
  }, [incomesData, expensesData]);

  if (getCashFlowTrend.isLoading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  if (getCashFlowTrend.isError) {
    return (
      <Text className="text-md font-medium text-center text-destructive mb-2">
        Failed to load balance trend
      </Text>
    );
  }

  if (!incomesData || incomesData.length === 0) {
    return (
      <Text className="text-md font-medium text-center text-muted-foreground mb-2">
        No data for selected period
      </Text>
    );
  }

  return (
    <Card>
      <View className="flex flex-row items-center justify-between mb-4">
        <Text className="text-md font-semibold text-foreground">
          Balance trend
        </Text>
      </View>

      <LineChart
        curved
        areaChart
        width={265}
        height={200}

        data={incomesData}
        data2={expensesData}

        spacing={35}
        initialSpacing={10}
        endSpacing={10}

        maxValue={adjustedMaxValue}
        mostNegativeValue={adjustedMinValue}
        noOfSections={5}

        color1="rgb(34, 197, 94)"
        color2="rgb(239, 68, 68)"
        startFillColor1="rgb(34, 197, 94)"
        endFillColor1="rgb(34, 197, 94)"
        startFillColor2="rgb(239, 68, 68)"
        endFillColor2="rgb(239, 68, 68)"
        startOpacity1={0.7}
        endOpacity1={0.3}
        startOpacity2={0.7}
        endOpacity2={0.3}

        hideDataPoints1
        hideDataPoints2

        yAxisThickness={0}
        xAxisThickness={0}
        yAxisLabelPrefix="$"
        yAxisLabelWidth={50}
        yAxisLabelContainerStyle={{ width: 44 }}
        yAxisTextStyle={{
          color: colors.mutedForeground,
          fontSize: 10,
          fontWeight: "500",
        }}
        xAxisLabelTextStyle={{
          color: "white",
          fontSize: 7,
          fontWeight: "500",
          marginTop: 8,
        }}

        rulesType="solid"
        rulesColor="rgba(255,255,255,0.1)"
        showVerticalLines
        verticalLinesColor="rgba(255,255,255,0.05)"
      />
    </Card>
  );
};

export { BalanceTrend };
