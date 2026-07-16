import { useMemo, useState } from 'react'
import { Sparkles, Armchair } from 'lucide-react'
import clsx from 'clsx'

import AppLayout from '../components/layout/AppLayout'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'

import { useApiState } from '../hooks/useApiState'
import { useToast } from '../hooks/useToast'

import { employeeService } from '../api/employeeService'
import { projectService } from '../api/projectService'
import { seatService } from '../api/seatService'

import { EMPLOYEE_STATUS, ZONES } from '../utils/constants'

export default function NewJoinerAllocationPage() {
  const toast = useToast()

  const { data: employeeResp, refetch } = useApiState(
    () => employeeService.list({ status: EMPLOYEE_STATUS.PENDING, page_size: 100 }),
    []
  )
  const { data: projectsResp } = useApiState(() => projectService.list({ page_size: 100 }), [])
  const { data: seatsResp, refetch: refetchSeats } = useApiState(
    () => seatService.available({ page_size: 1000 }),
    []
  )

  const employees = employeeResp?.items || employeeResp?.results || employeeResp || []
  const projects = projectsResp?.items || projectsResp?.results || projectsResp || []
  const availableSeats = seatsResp?.items || seatsResp?.results || seatsResp || []

  const [form, setForm] = useState({ employeeId: '', name: '', email: '', dept: '', projectId: '', zone: '' })
  const [suggestions, setSuggestions] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  // When an existing pending joiner is picked, prefill their details.
  const onSelectEmployee = (e) => {
    const id = e.target.value
    const emp = employees.find((x) => String(x.id) === String(id))
    pickEmployee(emp, id)
  }

  // Shared: prefill the form from a pending joiner (used by the dropdown and the list).
  const pickEmployee = (emp, id = emp?.id) => {
    setForm((f) => ({
      ...f,
      employeeId: id != null ? String(id) : f.employeeId,
      name: emp?.name || f.name,
      email: emp?.email || f.email,
      dept: emp?.department || emp?.dept || f.dept,
      projectId: emp?.project_id != null ? String(emp.project_id) : f.projectId,
    }))
  }

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.name} (${e.employee_code})`,
  }))
  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }))
  const zoneOptions = ZONES.map((z) => ({ value: z, label: `Zone ${z}` }))

  // Client-side seat suggestion over the real available-seats endpoint:
  // prioritise seats near the project's team, then by preferred zone.
  const suggestSeats = () => {
    if (!form.name) {
      toast.info('Enter a name first')
      return
    }
    const projSeats = availableSeats.filter(
      (s) => form.projectId && String(s.project_id) === String(form.projectId)
    )
    const teamFloors = {}
    projSeats.forEach((s) => {
      teamFloors[s.floor] = (teamFloors[s.floor] || 0) + 1
    })
    const topFloor = Object.keys(teamFloors).sort((a, b) => teamFloors[b] - teamFloors[a])[0]

    const ranked = [...availableSeats].sort((a, b) => {
      const zoneRank = (form.zone ? (b.zone === form.zone) - (a.zone === form.zone) : 0)
      if (zoneRank !== 0) return zoneRank
      return (b.floor === topFloor) - (a.floor === topFloor)
    })

    setSuggestions(
      ranked.slice(0, 4).map((s) => ({
        ...s,
        nearTeam: s.floor === topFloor && !!topFloor,
        prefZone: !!form.zone && s.zone === form.zone,
      }))
    )
  }

  const allocate = async (seat) => {
    if (!form.employeeId) {
      toast.info('Select a pending joiner to allocate to')
      return
    }
    setSubmitting(true)
    try {
      await seatService.allocate({
        seat_id: seat.id,
        employee_id: form.employeeId,
        project_id: form.projectId || undefined,
      })
      toast.success(`${form.name || 'Joiner'} allocated to ${seat.seat_number}`)
      setSuggestions(null)
      setForm({ employeeId: '', name: '', email: '', dept: '', projectId: '', zone: '' })
      refetch()
      refetchSeats()
    } catch (err) {
      toast.error(err.message || 'Seat allocation failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const suggestSub = useMemo(() => {
    if (suggestions) {
      return `${suggestions.length} seats matched — prioritised by team proximity`
    }
    return 'Suggestions will appear here once you submit the form.'
  }, [suggestions])

  return (
    <AppLayout title="New Joiner Allocation" subtitle="Seat new hires near their team">
      {/* Pending joiners — visible list of names waiting for a seat */}
      <div className="mx-auto mb-4 max-w-[1000px] rounded-2xl border border-surface-200 bg-white p-[22px] shadow-card">
        <div className="mb-3 flex items-center gap-2.5">
          <h3 className="font-display text-[16px] font-semibold text-surface-900">
            Pending joiners
          </h3>
          <span className="rounded-full bg-warning-bg px-[9px] py-[3px] text-[11px] font-bold text-warning">
            {employees.length}
          </span>
        </div>
        {employees.length === 0 ? (
          <p className="text-[12.5px] text-surface-400">No employees are currently pending allocation.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {employees.map((emp) => {
              const selected = String(form.employeeId) === String(emp.id)
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => pickEmployee(emp)}
                  className={clsx(
                    'flex flex-col items-start rounded-xl border px-3.5 py-2.5 text-left transition-colors',
                    selected
                      ? 'border-brand-300 bg-brand-50'
                      : 'border-surface-200 bg-surface-50 hover:bg-surface-100'
                  )}
                >
                  <span className="truncate text-[13.5px] font-semibold text-surface-900">
                    {emp.name}
                  </span>
                  <span className="truncate text-[12px] text-surface-400">
                    {[emp.employee_code, emp.department, emp.project_name].filter(Boolean).join(' · ')}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr]">
        {/* Left: form */}
        <div className="rounded-2xl border border-surface-200 bg-white p-[22px] shadow-card">
          <h3 className="font-display text-[16px] font-semibold text-surface-900">Add a new joiner</h3>
          <p className="mt-1 mb-5 text-[12.5px] text-surface-400">
            Enter details, then let the system suggest seats near their project team.
          </p>

          <div className="space-y-3.5">
            {employeeOptions.length > 0 && (
              <Select
                label="Pending joiner"
                options={employeeOptions}
                value={form.employeeId}
                onChange={onSelectEmployee}
                placeholder="Select a pending joiner…"
              />
            )}
            <Input
              label="Full name"
              placeholder="e.g. Priya Verma"
              value={form.name}
              onChange={set('name')}
            />
            <Input
              label="Work email"
              placeholder="name@ethara.ai"
              value={form.email}
              onChange={set('email')}
            />
            <div className="flex gap-3">
              <Input
                className="flex-1"
                label="Department"
                placeholder="Engineering"
                value={form.dept}
                onChange={set('dept')}
              />
              <Select
                className="flex-1"
                label="Project"
                options={projectOptions}
                value={form.projectId}
                onChange={set('projectId')}
                placeholder="Select project…"
              />
            </div>
            <Select
              label="Preferred zone"
              options={zoneOptions}
              value={form.zone}
              onChange={set('zone')}
              placeholder="No preference"
            />
            <Button icon={Sparkles} className="w-full py-3 text-[14px]" onClick={suggestSeats}>
              Suggest available seats
            </Button>
          </div>
        </div>

        {/* Right: suggestions */}
        <div className="rounded-2xl border border-surface-200 bg-white p-[22px] shadow-card">
          <h3 className="font-display text-[16px] font-semibold text-surface-900">Suggested seats</h3>
          <p className="mt-1 mb-[18px] text-[12.5px] text-surface-400">{suggestSub}</p>

          {suggestions && suggestions.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className={clsx(
                    'flex items-center gap-3 rounded-xl border p-3.5',
                    s.nearTeam ? 'border-[#a7f3d0] bg-[#f6fefb]' : 'border-surface-200 bg-surface-50'
                  )}
                >
                  <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] bg-[#ecfdf5] font-display text-[12px] font-bold text-[#059669]">
                    {s.seat_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-surface-900">
                      {s.floor} · Zone {s.zone} · Bay {s.bay}
                    </p>
                    <p className="text-[12px] text-surface-400">
                      {s.nearTeam
                        ? s.prefZone
                          ? 'Near team · preferred zone'
                          : 'Near your project team'
                        : s.prefZone
                          ? 'In your preferred zone'
                          : 'Available seat'}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => allocate(s)} loading={submitting}>
                    Allocate
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-[1.5px] border-dashed border-surface-200 px-4 py-11 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[13px] bg-surface-100 text-surface-300">
                <Armchair className="h-[22px] w-[22px]" />
              </div>
              <p className="text-[13.5px] font-semibold text-surface-700">No suggestions yet</p>
              <p className="mt-1 text-[12.5px] text-surface-400">Fill in the form and press suggest.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
