import { Pencil, Trash2, Users } from 'lucide-react'
import Table from '../common/Table'
import StatusBadge from '../common/StatusBadge'
import Button from '../common/Button'

export default function ProjectTable({ projects, canManage, onEdit, onDelete, onViewEmployees }) {
  const columns = [
    { key: 'name', header: 'Project', className: 'font-medium text-surface-900' },
    { key: 'manager_name', header: 'Manager' },
    {
      key: 'employee_count',
      header: 'Employees',
      className: 'tabular',
      render: (row) => (
        <button
          onClick={() => onViewEmployees?.(row)}
          className="inline-flex items-center gap-1 text-brand-600 hover:underline"
        >
          <Users className="h-3.5 w-3.5" />
          {row.employee_count ?? 0}
        </button>
      ),
    },
    {
      key: 'seat_count',
      header: 'Seats allocated',
      className: 'tabular',
      render: (row) => row.allocated_seats ?? 0,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  if (canManage) {
    columns.push({
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => onEdit(row)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="text-red-500 hover:bg-red-50"
            onClick={() => onDelete(row)}
          >
            Delete
          </Button>
        </div>
      ),
    })
  }

  return <Table columns={columns} rows={projects} />
}