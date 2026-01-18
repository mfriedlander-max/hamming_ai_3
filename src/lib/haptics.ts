type HapticIntensity = 'light' | 'medium' | 'heavy'

const DURATION_MAP: Record<HapticIntensity, number> = {
  light: 10,
  medium: 25,
  heavy: 50,
}

/**
 * Trigger haptic feedback on supported devices.
 * Degrades gracefully when navigator.vibrate is not available.
 */
export function triggerHaptic(intensity: HapticIntensity = 'medium'): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(DURATION_MAP[intensity])
  }
}
