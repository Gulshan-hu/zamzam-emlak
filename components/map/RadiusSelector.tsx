'use client'

interface RadiusSelectorProps {
  selectedRadius: number
  onRadiusChange: (radius: number) => void
}

const RADIUS_OPTIONS = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
  { value: 5000, label: '5km' },
]

export function RadiusSelector({ selectedRadius, onRadiusChange }: RadiusSelectorProps) {
  return (
    <div className="flex gap-2">
      {RADIUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onRadiusChange(option.value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedRadius === option.value
              ? 'bg-primary text-white'
              : 'bg-surface text-text-primary hover:bg-surface-muted'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
