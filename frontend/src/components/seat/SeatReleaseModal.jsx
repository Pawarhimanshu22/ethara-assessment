import ConfirmDialog from '../common/ConfirmDialog'

export default function SeatReleaseModal({ open, onClose, onConfirm, seat, submitting = false }) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={() => onConfirm({ employee_id: seat?.employee_id })}
      title="Release this seat?"
      message={
        seat
          ? `Seat ${seat.seat_number} will be freed from ${seat.employee_name || 'the current occupant'} and become available for reallocation.`
          : ''
      }
      confirmLabel="Release seat"
      variant="danger"
      loading={submitting}
    />
  )
}