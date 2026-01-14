/**
 * Types for the Household Mode feature
 *
 * Multi-user household support where families can share subscriptions,
 * combine taste profiles, and get household-aware recommendations.
 */

/**
 * Role of a member within a household
 */
export type HouseholdRole = 'owner' | 'member'

/**
 * A household that can contain multiple members
 */
export interface Household {
  id: string
  name: string
  created_by: string | null
  invite_code: string
  created_at: string
}

/**
 * A member of a household
 */
export interface HouseholdMember {
  id: string
  household_id: string
  user_id: string
  role: HouseholdRole
  display_name: string | null
  joined_at: string
}

/**
 * Member with profile information
 */
export interface HouseholdMemberWithProfile extends HouseholdMember {
  profile?: {
    id: string
    name: string | null
    avatar_url?: string | null
  }
}

/**
 * Household with its members
 */
export interface HouseholdWithMembers extends Household {
  members: HouseholdMemberWithProfile[]
}

/**
 * Aggregated taste profile from multiple household members
 */
export interface AggregatedTaste {
  genres: string[]
  favorite_shows: string[]
  member_count: number
}

/**
 * Taste profile for a single user (for aggregation)
 */
export interface TasteProfile {
  user_id: string
  genres: string[]
  favorite_shows: string[]
}

/**
 * Request to create a new household
 */
export interface CreateHouseholdRequest {
  name: string
}

/**
 * Request to join a household
 */
export interface JoinHouseholdRequest {
  invite_code: string
  display_name?: string
}

/**
 * Request to update a household
 */
export interface UpdateHouseholdRequest {
  name: string
}
