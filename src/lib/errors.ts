import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function errorResponse(
  message: string,
  statusCode: number = 500
): NextResponse {
  return NextResponse.json({ error: message }, { status: statusCode })
}
