import AppLayout from '../components/layout/AppLayout'
import SummaryCards from '../components/dashboard/SummaryCards'
import ProjectUtilizationChart from '../components/dashboard/ProjectUtilizationChart'
import FloorUtilizationChart from '../components/dashboard/FloorUtilizationChart'
import PendingJoinersWidget from '../components/dashboard/PendingJoinersWidget'
import ErrorState from '../components/common/ErrorState'
import { useApiState } from '../hooks/useApiState'
import { dashboardService } from '../api/dashboardService'
import { employeeService } from '../api/employeeService'
import { EMPLOYEE_STATUS } from '../utils/constants'

export default function DashboardPage() {
  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useApiState(() => dashboardService.summary(), [])

  const { data: projectUtil } = useApiState(() => dashboardService.projectUtilization(), [])
  const { data: floorUtil } = useApiState(() => dashboardService.floorUtilization(), [])
  const { data: pendingResp } = useApiState(
    () => employeeService.list({ status: EMPLOYEE_STATUS.PENDING, page_size: 10 }),
    []
  )

  const pendingEmployees = pendingResp?.items || pendingResp?.results || pendingResp || []

  return (
    <AppLayout title="Dashboard">
      <div className="animate-fadeup mx-auto max-w-[1180px] space-y-4">
        {summaryError ? (
          <ErrorState message={summaryError} onRetry={refetchSummary} />
        ) : (
          <SummaryCards summary={summary} loading={summaryLoading} />
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
          <ProjectUtilizationChart data={projectUtil || []} />
          <FloorUtilizationChart data={floorUtil || []} />
        </div>

        <PendingJoinersWidget employees={Array.isArray(pendingEmployees) ? pendingEmployees : []} />
      </div>
    </AppLayout>
  )
}