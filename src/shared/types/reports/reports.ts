import { ApiResponse } from "../api"

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

export { ReportsSummaryRequest, ReportsSummaryResponse }