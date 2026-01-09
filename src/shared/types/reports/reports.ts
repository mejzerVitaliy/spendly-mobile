import { TransactionType } from "@/shared/constants"
import { ApiResponse } from "../api"

interface CategoryBarChartItem {
  value: number
  label: string
  frontColor: string
}

interface CategoryPieChartItem {
  value: number
  color: string
  label: string
  focused?: boolean
}

interface LineChartItem {
  value: number
  dataPointText?: string
  label: string
}

interface ReportsSummaryRequest {
  startDate?: string
  endDate?: string
}

interface ReportsSummaryResponse 
  extends ApiResponse<{
    totalBalance: number
    totalIncome: number
    totalExpense: number
  }> {}

interface ReportsCategoryBarChartRequest {
  startDate?: string
  endDate?: string
  type?: TransactionType
}

interface ReportsCategoryBarChartResponse 
  extends ApiResponse<{
    data: CategoryBarChartItem[]
    period: {
      from: string
      to: string
    }
    totalExpenses: number
  }> {}

interface ReportsCategoryPieChartRequest {
  startDate?: string
  endDate?: string
  type?: TransactionType
}

interface ReportsCategoryPieChartResponse 
  extends ApiResponse<{
    data: CategoryPieChartItem[]
    period: {
      from: string
      to: string
    }
    totalExpenses: number
  }> {}

interface ReportsIncomesExpensesTrendChartRequest {
  startDate?: string
  endDate?: string
}

interface ReportsIncomesExpensesTrendChartResponse 
  extends ApiResponse<{
    expenses: LineChartItem[]
    incomes: LineChartItem[]
    period: {
      from: string
      to: string
    }
  }> {}

interface ReportsBalanceTrendChartRequest {
  startDate?: string
  endDate?: string
}

interface ReportsBalanceTrendChartResponse 
  extends ApiResponse<{
    data: LineChartItem[]
    period: {
      from: string
      to: string
    }
  }> {}

export {
  CategoryBarChartItem,
  CategoryPieChartItem,
  ReportsCategoryBarChartRequest,
  ReportsCategoryBarChartResponse,
  ReportsCategoryPieChartRequest,
  ReportsCategoryPieChartResponse,
  ReportsIncomesExpensesTrendChartRequest,
  ReportsIncomesExpensesTrendChartResponse,
  ReportsBalanceTrendChartRequest,
  ReportsBalanceTrendChartResponse,
  ReportsSummaryRequest,
  ReportsSummaryResponse
}
