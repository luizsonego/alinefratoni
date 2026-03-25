import type { HTMLAttributes } from 'react'

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

const roundedMap = {
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full',
}

export function Skeleton({ className = '', rounded = 'md', ...rest }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-zinc-800/80 ${roundedMap[rounded]} ${className}`}
      {...rest}
    />
  )
}
