import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/v1/uploads/status?sessionId=... OR ?userId=...
 *
 * Returns status of one session (if sessionId) or all active sessions for a user (if userId).
 *
 * Backend: SELECT * FROM upload_sessions WHERE id = $1 OR user_id = $1
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')
  const userId = req.nextUrl.searchParams.get('userId')

  if (!sessionId && !userId) {
    return NextResponse.json(
      { success: false, error: 'Provide sessionId or userId' },
      { status: 400 },
    )
  }

  // Simulated response — real impl queries PostgreSQL
  return NextResponse.json({
    success: true,
    sessions: sessionId
      ? [{
          sessionId,
          status: 'uploading',
          progress: 42,
          uploadedBytes: 35 * 1024 ** 2,
          totalBytes: 84 * 1024 ** 2,
          speedBytesPerSec: 12_400_000,
          etaSeconds: 4,
          currentChunk: 5,
          totalChunks: 11,
          startedAt: new Date(Date.now() - 30_000).toISOString(),
        }]
      : [
          { sessionId: 'us_demo1', status: 'uploading', progress: 64, filename: 'Foundation Report.pdf' },
          { sessionId: 'us_demo2', status: 'paused', progress: 28, filename: 'Site Survey.mp4' },
        ],
  })
}
