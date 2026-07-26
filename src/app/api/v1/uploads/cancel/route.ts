import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/v1/uploads/cancel
 * Body: { sessionId, reason? }
 *
 * Backend: marks session as cancelled, deletes any uploaded chunks from MinIO,
 * logs to activity_logs with reason. Files already completed are NOT affected.
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, reason } = await req.json()
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId' },
        { status: 400 },
      )
    }
    // Real impl:
    //   await prisma.uploadSession.update({ where: { id: sessionId }, data: { status: 'cancelled', cancelledAt: new Date() } })
    //   await minio.removeObjects('corefiles-prod', chunksToDelete)
    //   await auditLog({ action: 'upload.cancel', sessionId, reason })

    return NextResponse.json({
      success: true,
      sessionId,
      cancelledAt: new Date().toISOString(),
      reason: reason || 'user_cancelled',
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message },
      { status: 500 },
    )
  }
}
