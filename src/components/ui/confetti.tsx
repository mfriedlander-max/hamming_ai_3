import confetti from 'canvas-confetti'

/**
 * Fire a celebration confetti burst with SubCycle brand colors
 */
export async function fireConfetti(): Promise<void> {
  // Green and gold colors matching SubCycle brand
  const colors = ['#22c55e', '#16a34a', '#fbbf24', '#f59e0b']

  await confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  })
}
