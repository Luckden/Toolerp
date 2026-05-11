import type { FormEventHandler, ReactNode } from 'react'
import { ErrorPane } from './ErrorPane'
import { ApiClientError } from '../lib/api/client'

type EntityEditorDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  title: string
  description: string
  submitLabel: string
  isSubmitting?: boolean
  error?: ApiClientError | Error | null
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
}

export function EntityEditorDialog({
  open,
  mode,
  title,
  description,
  submitLabel,
  isSubmitting,
  error,
  onClose,
  onSubmit,
  children,
}: EntityEditorDialogProps) {
  if (!open) {
    return null
  }

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-3xl rounded-[1.75rem] border border-base-300 bg-base-100 p-0 shadow-2xl">
        <div className="border-b border-base-300 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {mode === 'create' ? 'Create record' : 'Edit record'}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-base-content">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-base-content/70">{description}</p>
            </div>
            <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 px-6 py-6">
          <ErrorPane error={error ?? null} />
          {children}

          <div className="flex flex-col-reverse gap-3 border-t border-base-300 pt-5 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  )
}