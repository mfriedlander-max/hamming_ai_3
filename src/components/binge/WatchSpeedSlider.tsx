'use client'

interface WatchSpeedSliderProps {
  value: number
  onChange: (value: number) => void
}

const SPEED_LABELS: Record<number, string> = {
  1: 'Casual',
  2: 'Regular',
  3: 'Steady',
  4: 'Fast',
  5: 'Intense',
  6: 'Marathon',
}

export function WatchSpeedSlider({ value, onChange }: WatchSpeedSliderProps) {
  const label = SPEED_LABELS[value] || 'Regular'
  const episodeText = value === 1 ? 'episode' : 'episodes'

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          Watch Speed
        </label>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <input
        type="range"
        role="slider"
        min={1}
        max={6}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        aria-valuenow={value}
        aria-valuemin={1}
        aria-valuemax={6}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>1/day</span>
        <span className="font-medium text-gray-700">
          {value} {episodeText}/day
        </span>
        <span>6/day</span>
      </div>
    </div>
  )
}
