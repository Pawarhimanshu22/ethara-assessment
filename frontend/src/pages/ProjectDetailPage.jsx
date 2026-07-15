import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import AppLayout from '../components/layout/AppLayout'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'
import ProjectEmployeeList from '../components/project/ProjectEmployeeList'

import { useApiState } from '../hooks/useApiState'
import { projectService } from '../api/projectService'

const CHIP_PALETTE = [
  ['#eef2ff', '#4f46e5'],
  ['#ecfdf5', '#059669'],
  ['#fff1f3', '#e11d48'],
  ['#fffbeb', '#b45309'],
  ['#f0f9ff', '#0284c7'],
  ['#faf5ff', '#9333ea'],
]

const STATUS_META = {
  active: { label: 'Active', fg: '#059669', bg: '#ecfdf5' },
  on_hold: { label: 'On hold', fg: '#b45309', bg: '#fffbeb' },
  inactive: { label: 'Inactive', fg: '#475569', bg: '#f1f5f9' },
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="tabular font-display text-[22px] font-bold text-surface-900">{value}</p>
      <p className="text-[11.5px] text-surface-400">{label}</p>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: project, loading, error, refetch } = useApiState(
    () => projectService.get(id),
    [id]
  )

  const { data: employeesResp, loading: employeesLoading } = useApiState(
    () => projectService.getEmployees(id),
    [id]
  )

  const employees = employeesResp?.items || employeesResp?.results || employeesResp || []

  return (
    <AppLayout title="Project Details">
      <div className="animate-fadeup mx-auto max-w-[1180px] space-y-4">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          className="mb-1"
          onClick={() => navigate('/projects')}
        >
          Back to projects
        </Button>

        {loading ? (
          <LoadingSpinner label="Loading project..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !project ? (
          <ErrorState
            title="Project not found"
            message="The requested project could not be found."
          />
        ) : (
          (() => {
            const [chipBg, chipFg] =
              CHIP_PALETTE[(Number(project.id) || 0) % CHIP_PALETTE.length]
            const meta =
              STATUS_META[String(project.status || '').toLowerCase()] || STATUS_META.inactive
            const mono = String(project.name || '?').slice(0, 2).toUpperCase()

            return (
              <>
                {/* Header card */}
                <div className="rounded-2xl border border-surface-200 bg-white p-[22px] shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-[13px]">
                      <div
                        className="flex h-[50px] w-[50px] items-center justify-center rounded-[13px] font-display text-[17px] font-bold"
                        style={{ background: chipBg, color: chipFg }}
                      >
                        {mono}
                      </div>
                      <div>
                        <h2 className="text-[19px] font-bold text-surface-900">{project.name}</h2>
                        <p className="text-[12.5px] text-surface-400">
                          Managed by {project.manager_name}
                        </p>
                      </div>
                    </div>
                    <span
                      className="rounded-full px-3 py-[5px] text-[12px] font-semibold"
                      style={{ color: meta.fg, background: meta.bg }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {project.description && (
                    <p className="mt-4 text-[13px] leading-6 text-surface-600">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-4 flex gap-8 border-t border-surface-100 pt-4">
                    <Stat value={project.employee_count ?? employees.length} label="Members" />
                    <Stat value={project.allocated_seats ?? 0} label="Seats" />
                    <Stat value={project.floor_count ?? project.floors ?? '—'} label="Floors" />
                  </div>
                </div>

                {/* Employees */}
                <div className="space-y-3">
                  <h3 className="text-[15px] font-bold text-surface-900">Project employees</h3>
                  {employeesLoading ? (
                    <LoadingSpinner label="Loading employees..." />
                  ) : (
                    <ProjectEmployeeList employees={employees} />
                  )}
                </div>
              </>
            )
          })()
        )}
      </div>
    </AppLayout>
  )
}
