import { describe, it, expect } from 'vitest'
import { generateInviteCode, isValidInviteCode } from './invite'

describe('generateInviteCode', () => {
  it('should generate an 8 character code', () => {
    const code = generateInviteCode()
    expect(code).toHaveLength(8)
  })

  it('should only contain alphanumeric characters', () => {
    const code = generateInviteCode()
    expect(code).toMatch(/^[A-Z0-9]+$/)
  })

  it('should generate unique codes', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 100; i++) {
      codes.add(generateInviteCode())
    }
    // With 36^8 possibilities, 100 codes should all be unique
    expect(codes.size).toBe(100)
  })

  it('should not contain ambiguous characters (0, O, I, 1)', () => {
    // Generate many codes and check none contain ambiguous chars
    for (let i = 0; i < 50; i++) {
      const code = generateInviteCode()
      expect(code).not.toContain('0')
      expect(code).not.toContain('O')
      expect(code).not.toContain('I')
      expect(code).not.toContain('1')
    }
  })
})

describe('isValidInviteCode', () => {
  it('should return true for valid 8 character alphanumeric codes', () => {
    expect(isValidInviteCode('ABCD2345')).toBe(true)
    expect(isValidInviteCode('XYZ78WKM')).toBe(true)
  })

  it('should return false for codes that are too short', () => {
    expect(isValidInviteCode('ABC1234')).toBe(false)
    expect(isValidInviteCode('AB')).toBe(false)
    expect(isValidInviteCode('')).toBe(false)
  })

  it('should return false for codes that are too long', () => {
    expect(isValidInviteCode('ABCD12345')).toBe(false)
    expect(isValidInviteCode('ABCDEFGHIJ')).toBe(false)
  })

  it('should return false for codes with invalid characters', () => {
    expect(isValidInviteCode('ABCD-234')).toBe(false)
    expect(isValidInviteCode('ABCD 234')).toBe(false)
    expect(isValidInviteCode('abcd2345')).toBe(false) // lowercase not allowed
  })

  it('should return true for generated codes', () => {
    const code = generateInviteCode()
    expect(isValidInviteCode(code)).toBe(true)
  })
})
