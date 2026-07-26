import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/v1/uploads/pause
 * Body: { sessionId }
 *
 * Backend: marks session as paused (chunks already uploaded are preserved).
 * The frontend stops sending chunks. Resume continues from last completed chunk.
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 })
    }
    // Real impl:
    //   await prisma.uploadSession.update({ where: { id: sessionId }, data: { status: 'paused', pausedAt: new Date() } })

    return NextResponse.json({
      success: true,
      sessionId,
      pausedAt: new Date().toISOString(),
      resumable: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days to resume
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
  }
}
