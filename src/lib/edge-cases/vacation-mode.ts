/**
 * Vacation Mode
 *
 * Allows users to pause all automatic actions while away.
 * Auto-pilot will skip users in vacation mode.
 */

import { createClient } from '@/lib/supabase/server'
import type { VacationStatus } from './types'

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.floor((date2.getTime() - date1.getTime()) / oneDay)
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Enable vacation mode for a user
 */
export async function enableVacationMode(
  userId: string,
  returnDate?: string
): Promise<void> {
  const supabase = await createClient()
  const today = formatDate(new Date())

  await supabase
    .from('profiles')
    .update({
      vacation_mode: true,
      vacation_start_date: today,
      vacation_return_date: returnDate ?? null,
    })
    .eq('id', userId)
}

/**
 * Disable vacation mode for a user
 */
export async function disableVacationMode(userId: string): Promise<void> {
  const supabase = await createClient()

  await supabase
    .from('profiles')
    .update({
      vacation_mode: false,
      vacation_start_date: null,
      vacation_return_date: null,
    })
    .eq('id', userId)
}

/**
 * Get vacation status for a user
 */
export async function getVacationStatus(userId: string): Promise<VacationStatus> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('vacation_mode, vacation_start_date, vacation_return_date')
    .eq('id', userId)
    .single()

  const isOnVacation = data?.vacation_mode ?? false
  const returnDate = data?.vacation_return_date ?? null

  let daysRemaining: number | null = null
  if (isOnVacation && returnDate) {
    const now = new Date()
    const returnDateObj = new Date(returnDate)
    daysRemaining = daysBetween(now, returnDateObj)
    if (daysRemaining < 0) daysRemaining = 0
  }

  return {
    is_on_vacation: isOnVacation,
    start_date: data?.vacation_start_date ?? null,
    return_date: returnDate,
    days_remaining: daysRemaining,
  }
}

/**
 * Check if vacation should be auto-disabled and disable if so
 * Returns true if vacation was disabled
 */
export async function checkAndAutoDisableVacation(userId: string): Promise<boolean> {
  const status = await getVacationStatus(userId)

  if (!status.is_on_vacation || !status.return_date) {
    return false
  }

  const now = new Date()
  const returnDate = new Date(status.return_date)

  // If return date has passed, disable vacation mode
  if (now > returnDate) {
    await disableVacationMode(userId)
    return true
  }

  return false
}

/**
 * Check if a user is currently on vacation
 */
export async function isOnVacation(userId: string): Promise<boolean> {
  const status = await getVacationStatus(userId)
  return status.is_on_vacation
}
