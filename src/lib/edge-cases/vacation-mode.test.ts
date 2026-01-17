/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  enableVacationMode,
  disableVacationMode,
  getVacationStatus,
  checkAndAutoDisableVacation,
  isOnVacation,
} from './vacation-mode'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('vacation-mode', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-17T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('enableVacationMode', () => {
    it('enables vacation mode for user', async () => {
      mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      await expect(enableVacationMode('user-123', '2026-01-25')).resolves.not.toThrow()

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          vacation_mode: true,
          vacation_start_date: '2026-01-17',
          vacation_return_date: '2026-01-25',
        })
      )
    })

    it('enables vacation mode without return date', async () => {
      mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      await expect(enableVacationMode('user-123')).resolves.not.toThrow()

      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          vacation_mode: true,
          vacation_start_date: '2026-01-17',
          vacation_return_date: null,
        })
      )
    })
  })

  describe('disableVacationMode', () => {
    it('disables vacation mode for user', async () => {
      mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      await expect(disableVacationMode('user-123')).resolves.not.toThrow()

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        vacation_mode: false,
        vacation_start_date: null,
        vacation_return_date: null,
      })
    })
  })

  describe('getVacationStatus', () => {
    it('returns vacation status with dates', async () => {
      const mockProfile = {
        id: 'user-123',
        vacation_mode: true,
        vacation_start_date: '2026-01-15',
        vacation_return_date: '2026-01-25',
      }

      mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const status = await getVacationStatus('user-123')

      expect(status).toMatchObject({
        is_on_vacation: true,
        start_date: '2026-01-15',
        return_date: '2026-01-25',
        days_remaining: 7, // Jan 17 10:00 -> Jan 25 00:00 = 7 full days
      })
    })

    it('handles missing return date (indefinite vacation)', async () => {
      const mockProfile = {
        id: 'user-123',
        vacation_mode: true,
        vacation_start_date: '2026-01-15',
        vacation_return_date: null,
      }

      mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const status = await getVacationStatus('user-123')

      expect(status).toMatchObject({
        is_on_vacation: true,
        start_date: '2026-01-15',
        return_date: null,
        days_remaining: null,
      })
    })
  })

  describe('checkAndAutoDisableVacation', () => {
    it('auto-disables vacation after return date', async () => {
      // Return date was yesterday
      const mockProfile = {
        id: 'user-123',
        vacation_mode: true,
        vacation_start_date: '2026-01-10',
        vacation_return_date: '2026-01-16', // Yesterday
      }

      mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const wasDisabled = await checkAndAutoDisableVacation('user-123')

      expect(wasDisabled).toBe(true)
    })

    it('does not disable vacation before return date', async () => {
      // Return date is next week
      const mockProfile = {
        id: 'user-123',
        vacation_mode: true,
        vacation_start_date: '2026-01-15',
        vacation_return_date: '2026-01-25', // Next week
      }

      mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const wasDisabled = await checkAndAutoDisableVacation('user-123')

      expect(wasDisabled).toBe(false)
    })
  })

  describe('isOnVacation', () => {
    it('checks if user is on vacation', async () => {
      const mockProfile = {
        id: 'user-123',
        vacation_mode: true,
        vacation_start_date: '2026-01-15',
        vacation_return_date: '2026-01-25',
      }

      mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      }

      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const onVacation = await isOnVacation('user-123')

      expect(onVacation).toBe(true)
    })
  })
})
