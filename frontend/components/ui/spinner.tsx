import { cn } from '@/lib'
import { cva, VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import React, { HTMLAttributes } from 'react'

const spinnerVariants = cva('flex-col items-center justify-center', {
	variants: {
		show: {
			true: 'flex',
			false: 'hidden'
		}
	},
	defaultVariants: {
		show: true
	}
})

const loaderVariants = cva('animate-spin text-primary', {
	variants: {
		size: {
			small: 'size-8',
			medium: 'size-16',
			large: 'size-24'
		}
	},
	defaultVariants: {
		size: 'medium'
	}
})

interface SpinnerContentProps
	extends VariantProps<typeof spinnerVariants>,
		VariantProps<typeof loaderVariants> {
	className?: string;
	children?: React.ReactNode;
}

export function Spinner({ size, show, children, className }: SpinnerContentProps) {
	return (
		<span className={spinnerVariants({ show })}>
      <Loader2 className={cn(loaderVariants({ size }), className)} />
			{children}
    </span>
	)
}

export const SpinnerCentered = ({ size = 'large', ...props }: {
	size?: 'small' | 'medium' | 'large';
} & HTMLAttributes<HTMLDivElement>
) => (
	<div
		className={cn('flex items-center justify-center h-screen w-full', props.className)}>
		<Spinner className={cn(loaderVariants({ size }))} />
	</div>
)