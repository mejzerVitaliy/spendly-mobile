import { TransactionType } from "@/shared/constants"
import { ApiResponse } from "../api"

interface CategoryChartItem {
  value: number
  percentage: number
  label: string
  color: string
}

type CategoryBarChartItem = CategoryChartItem
type CategoryPieChartItem = CategoryChartItem

interface TrendPoint {
  value: number
  date: string
  label: string
}

interface ReportsSummaryRequest {
  startDate?: string
  endDate?: string
}

interface ReportsSummaryResponse
  extends ApiResponse<{
    totalBalance: number
    currencyCode: string
    totalIncome: number
    totalExpense: number
    netChange: number
    incomeCount: number
    expenseCount: number
    totalTransactions: number
    period: {
      startDate: string | null
      endDate: string | null
      isAllTime: boolean
    }
  }> {}

interface ReportsCategoryChartRequest {
  startDate?: string
  endDate?: string
  type?: TransactionType
  language?: string
}

interface ReportsCategoryChartResponse
  extends ApiResponse<{
    data: CategoryChartItem[]
    total: number
    currencyCode: string
    period: { from: string | null; to: string | null }
  }> {}

interface ReportsCashFlowTrendRequest {
  startDate?: string
  endDate?: string
}

interface ReportsCashFlowTrendResponse
  extends ApiResponse<{
    incomes: TrendPoint[]
    expenses: TrendPoint[]
    currencyCode: string
    period: { from: string; to: string }
  }> {}

export {
  CategoryChartItem,
  CategoryBarChartItem,
  CategoryPieChartItem,
  TrendPoint,
  ReportsSummaryRequest,
  ReportsSummaryResponse,
  ReportsCategoryChartRequest,
  ReportsCategoryChartResponse,
  ReportsCashFlowTrendRequest,
  ReportsCashFlowTrendResponse,
}
