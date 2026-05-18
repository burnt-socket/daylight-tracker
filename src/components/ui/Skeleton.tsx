interface Props {
  className?: string
}

export function Skeleton({ className = '' }: Props) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-pulse rounded-2xl bg-gray-200 dark:bg-slate-800 ${className}`}
    />
  )
}
