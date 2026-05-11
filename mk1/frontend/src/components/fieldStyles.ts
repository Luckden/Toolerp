import clsx from 'clsx'

export const fieldClassName =
  'input input-bordered w-full rounded-2xl border-base-300 bg-base-100 shadow-sm outline-none transition focus:border-primary focus:outline-none'

export const textAreaClassName =
  'textarea textarea-bordered min-h-28 w-full rounded-2xl border-base-300 bg-base-100 shadow-sm outline-none transition focus:border-primary focus:outline-none'

export const selectClassName = clsx(
  'select select-bordered w-full rounded-2xl border-base-300 bg-base-100 shadow-sm outline-none transition',
  'focus:border-primary focus:outline-none',
)