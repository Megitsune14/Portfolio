import { cn } from '@/lib/utils'

type SiteContainerProps = React.ComponentProps<'div'> & {
  narrow?: boolean
}

export function SiteContainer({ narrow, className, ...props }: SiteContainerProps) {
  return (
    <div
      className={cn(narrow ? 'site-container-narrow' : 'site-container', className)}
      {...props}
    />
  )
}

export function SiteSection({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('py-16 sm:py-20', className)} {...props} />
}
