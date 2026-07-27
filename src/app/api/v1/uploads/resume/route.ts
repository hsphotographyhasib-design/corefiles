import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/v1/uploads/resume
 * Body: { sessionId }
 *
 * Backend: returns list of incomplete chunks so client can resume from where
 * it left off. Already-completed chunks are NOT re-uploaded.
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 })
    }
    // Real impl:
    //   const session = await prisma.uploadSession.findUnique({ where: { id: sessionId }, include: { chunks: true } })
    //   if (!session) return 404
    //   if (session.expiresAt < new Date()) return 410 "session expired"
    //   const pendingChunks = session.chunks.filter(c => c.status !== 'done').map(c => c.index)

    return NextResponse.json({
      success: true,
      sessionId,
      resumedAt: new Date().toISOString(),
      pendingChunks: [],  // populated by real impl
      completedChunks: 0,
      totalChunks: 0,
      uploadUrl: `/api/v1/uploads/chunk?sessionId=${sessionId}`,
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 })
  }
}
