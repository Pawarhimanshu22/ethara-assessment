import Modal from '../common/Modal'
import StatusBadge from '../common/StatusBadge'

// Read-only seat inspector: shows location + who the seat is assigned to (if occupied).
export default function SeatDetailModal({ open, onClose, seat }) {
  if (!seat) return null

  const bay = seat.bay ? String(seat.bay).replace(/^bay\s*/i, '') : null
  const location = [
    seat.floor != null ? `Floor ${seat.floor}` : null,
    seat.zone ? `Zone ${seat.zone}` : null,
    bay ? `Bay ${bay}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const isOccupied = String(seat.status || '').toLowerCase() === 'occupied'

  const rows = [
    { k: 'Seat number', v: seat.seat_number },
    { k: 'Location', v: location || '—' },
    { k: 'Status', v: <StatusBadge status={seat.status} /> },
    { k: 'Assigned to', v: seat.employee_name || (isOccupied ? '—' : 'Not assigned') },
    { k: 'Project', v: seat.project_name || '—' },
  ]

  return (
    <Modal open={open} onClose={onClose} title={`Seat ${seat.seat_number}`}>
      <div className="flex flex-col gap-3.5">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between gap-4 border-b border-surface-100 pb-3 last:border-0">
            <span className="text-[13px] text-surface-400">{r.k}</span>
            <span className="text-right text-[13.5px] font-medium text-surface-900">{r.v}</span>
          </div>
        ))}
      </div>
    </Modal>
  )
}
