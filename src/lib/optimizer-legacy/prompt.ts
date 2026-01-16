import type { OptimizerInput, OptimizedSchedule, MonthPlan, ServiceAction } from './types'

/**
 * Build the Claude prompt for generating an optimized subscription schedule.
 */
export function buildOptimizerPrompt(input: OptimizerInput): string {
  return `You are a subscription optimization expert. Your task is to create an optimized 12-month subscribe/cancel schedule that maximizes content access while minimizing annual cost.

## User Data

### Current Subscriptions
${JSON.stringify(input.subscriptions, null, 2)}

### Taste Profile
- Preferred genres: ${input.taste_profile.genres.join(', ') || 'None specified'}
- Favorite shows: ${input.taste_profile.favorite_shows.join(', ') || 'None specified'}

### Content Calendar (Next 12 Months)
${JSON.stringify(input.content_by_month, null, 2)}

## Optimization Rules

1. **Keep services** with multiple matching releases in the same month
2. **Cancel services** with no matching content for 2+ consecutive months
3. **Re-subscribe** when new matching content arrives
4. **Consider binge windows**: Subscribe 1 month before a series release, watch, then cancel
5. **Prioritize** favorite shows and preferred genres when deciding what to keep

## Output Format

Return a JSON object with this exact structure:
{
  "current_annual_cost": <number>,
  "optimized_annual_cost": <number>,
  "savings": <number>,
  "months": [
    {
      "month": "YYYY-MM",
      "actions": [
        {
          "service_id": "<id>",
          "service_name": "<name>",
          "action": "subscribe" | "cancel" | "keep",
          "date": "YYYY-MM-DD",
          "reason": "<brief explanation>"
        }
      ],
      "active_services": ["<service_id1>", "<service_id2>"],
      "monthly_cost": <number>
    }
  ]
}

Start month: ${input.start_month}
Generate exactly 12 months of data.

Return ONLY the JSON object, no additional text or markdown formatting.`
}

const VALID_ACTIONS = ['subscribe', 'cancel', 'keep'] as const

/**
 * Parse and validate the Claude response for an optimized schedule.
 */
export function parseOptimizerResponse(response: string): OptimizedSchedule {
  // Try to extract JSON object from response
  const jsonMatch = response.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    throw new Error('Failed to parse optimizer response: No JSON object found')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('Failed to parse optimizer response: Invalid JSON')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Failed to parse optimizer response: Expected object')
  }

  const obj = parsed as Record<string, unknown>

  // Validate top-level fields
  if (typeof obj.current_annual_cost !== 'number') {
    throw new Error('Invalid optimizer response: missing or invalid current_annual_cost')
  }

  if (typeof obj.optimized_annual_cost !== 'number') {
    throw new Error('Invalid optimizer response: missing or invalid optimized_annual_cost')
  }

  if (typeof obj.savings !== 'number') {
    throw new Error('Invalid optimizer response: missing or invalid savings')
  }

  if (!Array.isArray(obj.months)) {
    throw new Error('Invalid optimizer response: missing or invalid months array')
  }

  // Validate each month
  const months: MonthPlan[] = obj.months.map((month, monthIndex) => {
    if (!month || typeof month !== 'object') {
      throw new Error(`Invalid month format at index ${monthIndex}`)
    }

    const m = month as Record<string, unknown>

    if (typeof m.month !== 'string' || !/^\d{4}-\d{2}$/.test(m.month)) {
      throw new Error(`Invalid month string at index ${monthIndex}`)
    }

    if (!Array.isArray(m.actions)) {
      throw new Error(`Invalid actions array at month ${monthIndex}`)
    }

    if (!Array.isArray(m.active_services)) {
      throw new Error(`Invalid active_services array at month ${monthIndex}`)
    }

    if (typeof m.monthly_cost !== 'number') {
      throw new Error(`Invalid monthly_cost at month ${monthIndex}`)
    }

    // Validate each action
    const actions: ServiceAction[] = m.actions.map((action, actionIndex) => {
      if (!action || typeof action !== 'object') {
        throw new Error(`Invalid action format at month ${monthIndex}, action ${actionIndex}`)
      }

      const a = action as Record<string, unknown>

      if (typeof a.service_id !== 'string') {
        throw new Error(`Missing service_id at month ${monthIndex}, action ${actionIndex}`)
      }

      if (typeof a.service_name !== 'string') {
        throw new Error(`Missing service_name at month ${monthIndex}, action ${actionIndex}`)
      }

      if (!VALID_ACTIONS.includes(a.action as typeof VALID_ACTIONS[number])) {
        throw new Error(`Invalid action "${a.action}" at month ${monthIndex}, action ${actionIndex}`)
      }

      if (typeof a.date !== 'string') {
        throw new Error(`Missing date at month ${monthIndex}, action ${actionIndex}`)
      }

      if (typeof a.reason !== 'string') {
        throw new Error(`Missing reason at month ${monthIndex}, action ${actionIndex}`)
      }

      return {
        service_id: a.service_id,
        service_name: a.service_name,
        action: a.action as ServiceAction['action'],
        date: a.date,
        reason: a.reason,
      }
    })

    return {
      month: m.month,
      actions,
      active_services: m.active_services as string[],
      monthly_cost: m.monthly_cost,
    }
  })

  return {
    current_annual_cost: obj.current_annual_cost,
    optimized_annual_cost: obj.optimized_annual_cost,
    savings: obj.savings,
    months,
  }
}
