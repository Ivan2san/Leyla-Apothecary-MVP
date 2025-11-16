import type { ReactNode } from 'react'

interface QuestionCardProps {
  title: string
  description?: string
  children: ReactNode
}

export function QuestionCard({ title, description, children }: QuestionCardProps) {
  return (
    <div className="rounded-3xl border border-forest/10 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="font-lora text-2xl text-forest">{title}</p>
        {description && <p className="text-sm text-forest/70">{description}</p>}
      </div>
      <div className="mt-6 space-y-4 text-forest/90">{children}</div>
    </div>
  )
}
