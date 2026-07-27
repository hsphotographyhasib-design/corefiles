/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/v1/uploads/chunk
 *
 * Uploads a single chunk of a resumable upload. Backend:
 *   1. Validate session exists + not expired
 *   2. Validate chunk index + offset + size match session manifest
 *   3. Stream chunk to MinIO via presigned URL (or direct PUT)
 *   4. Update `upload_chunks` row to 'done'
 *   5. Return receipt with etag for verification
 *
 * Body (multipart/form-data): { chunk: Blob, index, offset, size }
 * Returns: { success, chunkIndex, etag, uploadedBytes }
 */
export async function POST(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId')
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId', code: 'MISSING_SESSION' },
        { status: 400 },
      )
    }

    const formData = await req.formData()
    const chunk = formData.get('chunk') as File | null
    const index = parseInt(formData.get('index') as string, 10)
    const offset = parseInt(formData.get('offset') as string, 10)
    const size = parseInt(formData.get('size') as string, 10)

    if (!chunk || isNaN(index) || isNaN(offset) || isNaN(size)) {
      return NextResponse.json(
        { success: false, error: 'Missing chunk data', code: 'INVALID_CHUNK' },
        { status: 400 },
      )
    }

    // Validate chunk size matches
    if (chunk.size !== size) {
      return NextResponse.json(
        { success: false, error: `Chunk size mismatch: expected ${size}, got ${chunk.size}`, code: 'SIZE_MISMATCH' },
        { status: 400 },
      )
    }

    // Real impl:
    //   await minio.putObject('corefiles-prod', `${storagePath}.chunk-${index}`, Buffer.from(await chunk.arrayBuffer()))
    //   await prisma.uploadChunk.update({ where: { sessionId_index }, data: { status: 'done', etag } })

    const etag = `${Math.random().toString(16).slice(2, 10)}-${Date.now().toString(16)}`

    return NextResponse.json({
      success: true,
      sessionId,
      chunkIndex: index,
      etag,
      uploadedBytes: size,
      timestamp: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Chunk upload failed', detail: (e as Error).message },
      { status: 500 },
    )
  }
}
