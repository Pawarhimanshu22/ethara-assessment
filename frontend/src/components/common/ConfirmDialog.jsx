import { Trash2 } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="mb-3.5 flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-[#fff1f3]">
        <Trash2 className="h-[22px] w-[22px] text-[#e11d48]" />
      </div>
      <p className="text-[13.5px] leading-relaxed text-surface-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2.5">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}