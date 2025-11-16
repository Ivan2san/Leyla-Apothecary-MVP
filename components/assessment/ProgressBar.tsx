interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  label?: string
  percentOverride?: number
}

export function ProgressBar({ currentStep, totalSteps, label, percentOverride }: ProgressBarProps) {
  const percentage = percentOverride ?? Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-forest/80">
        <span>{label ?? `Question ${currentStep} of ${totalSteps}`}</span>
        <span>{percentage}% complete</span>
      </div>
      <div className="h-2 rounded-full bg-forest/10">
        <div
          className="h-2 rounded-full bg-sage transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
