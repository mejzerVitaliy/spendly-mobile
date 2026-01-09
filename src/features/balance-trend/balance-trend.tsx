import React, { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { useReports } from "@/shared/hooks";
import { Card } from "@/shared/ui";

interface BalanceTrendProps {
  startDate?: string;
  endDate?: string;
}

const BalanceTrend = ({ startDate, endDate }: BalanceTrendProps) => {
  const { getBalanceTrendChart } = useReports({ startDate, endDate });

  const chartData = getBalanceTrendChart.data?.data.data;

  const { positiveData, negativeData, adjustedMaxValue, adjustedMinValue } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return {
        positiveData: [],
        negativeData: [],
        adjustedMaxValue: 150,
        adjustedMinValue: -150,
      };
    }

    const maxValue = Math.max(...chartData.map(item => item.value));
    const minValue = Math.min(...chartData.map(item => item.value));

    return {
      positiveData: chartData.map(item => ({
        ...item,
        value: item.value > 0 ? item.value : 0,
      })),
      negativeData: chartData.map(item => ({
        ...item,
        value: item.value < 0 ? item.value : 0,
      })),
      adjustedMaxValue: Math.max(maxValue + 150, 150),
      adjustedMinValue: Math.min(minValue - 150, -150),
    };
  }, [chartData]);

  if (getBalanceTrendChart.isLoading) {
    return <ActivityIndicator size="large" color="#3b82f6" />;
  }

  if (getBalanceTrendChart.isError) {
    return (
      <Text className="text-md font-medium text-center text-destructive mb-2">
        Failed to load balance trend
      </Text>
    );
  }

  if (!chartData || chartData.length === 0) {
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

        data={positiveData}
        data2={negativeData}

        spacing={35}
        initialSpacing={10}
        endSpacing={10}

        maxValue={adjustedMaxValue}
        mostNegativeValue={adjustedMinValue}
        noOfSections={5}

        /** Colors */
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

        /** Data points */
        hideDataPoints1
        hideDataPoints2

        /** Axis */
        yAxisThickness={0}
        xAxisThickness={0}
        yAxisLabelPrefix="$"
        yAxisLabelWidth={50}
        yAxisLabelContainerStyle={{ width: 44 }}
        yAxisTextStyle={{
          color: "#9ca3af",
          fontSize: 10,
          fontWeight: "500",
        }}
        xAxisLabelTextStyle={{
          color: "white",
          fontSize: 7,
          fontWeight: "500",
          marginTop: 8,
        }}

        /** Grid */
        rulesType="solid"
        rulesColor="rgba(255,255,255,0.1)"
        showVerticalLines
        verticalLinesColor="rgba(255,255,255,0.05)"
      />
    </Card>
  );
};

export { BalanceTrend };

