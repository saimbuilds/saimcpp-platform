import * as React from 'react'
import { cn } from '@/lib/utils'

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
    <select
        ref={ref}
        className={cn(
            'flex h-12 w-full rounded-xl border-2 border-purple-500/20 bg-secondary px-4 py-2 text-base',
            'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200',
            'appearance-none bg-no-repeat',
            'hover:border-purple-500/40',
            '[&>option]:bg-secondary [&>option]:text-foreground [&>option]:py-2',
            '[&>option:hover]:bg-purple-500/20 [&>option:checked]:bg-purple-500/30',
            className
        )}
        style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239333EA' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1.5em 1.5em',
        }}
        {...props}
    >
        {children}
    </select>
))
Select.displayName = 'Select'

export { Select }
