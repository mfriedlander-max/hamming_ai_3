/**
 * Invite code generation and validation for households
 */

// Characters that are easy to read and not ambiguous
// Excludes: 0, O, I, 1 (easily confused)
const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const INVITE_CODE_LENGTH = 8

/**
 * Generate a random invite code for a household
 * Returns an 8-character uppercase alphanumeric code
 * Excludes ambiguous characters (0, O, I, 1) for readability
 */
export function generateInviteCode(): string {
  let code = ''
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * INVITE_CODE_CHARS.length)
    code += INVITE_CODE_CHARS[randomIndex]
  }
  return code
}

/**
 * Validate that a string is a valid invite code format
 * Must be exactly 8 uppercase alphanumeric characters
 */
export function isValidInviteCode(code: string): boolean {
  if (!code || code.length !== INVITE_CODE_LENGTH) {
    return false
  }
  // Must be uppercase alphanumeric only
  return /^[A-Z0-9]+$/.test(code)
}
