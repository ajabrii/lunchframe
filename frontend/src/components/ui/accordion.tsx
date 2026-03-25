import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AccordionContextType {
  openValue: string | null
  setOpenValue: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextType | null>(null)

interface AccordionProps {
  children: React.ReactNode
  type?: 'single'
  collapsible?: boolean
}

const Accordion = ({ children, collapsible = false }: AccordionProps) => {
  const [openValue, setOpenValueState] = React.useState<string | null>(null)

  const setOpenValue = (value: string) => {
    setOpenValueState((current) => {
      if (current === value && collapsible) return null
      return value
    })
  }

  return <AccordionContext.Provider value={{ openValue, setOpenValue }}>{children}</AccordionContext.Provider>
}

const AccordionItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('border-b border-zinc-800', className)} {...props} />
)
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  const itemValue = value ?? ''
  const isOpen = context?.openValue === itemValue

  return (
    <div className="flex">
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex w-full items-center justify-between py-4 text-left text-sm font-medium text-zinc-100 transition-all hover:text-violet-300',
          className
        )}
        onClick={() => context?.setOpenValue(itemValue)}
        {...props}
      >
        {children}
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
    </div>
  )
})
AccordionTrigger.displayName = 'AccordionTrigger'

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: string }>(
  ({ className, children, value }, ref) => {
    const context = React.useContext(AccordionContext)
    const itemValue = value ?? ''
    const isOpen = context?.openValue === itemValue

    if (!isOpen) return null

    return (
      <div ref={ref} className="overflow-hidden text-sm text-zinc-400">
        <div className={cn('pb-4 pt-0', className)}>{children}</div>
      </div>
    )
  }
)
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
