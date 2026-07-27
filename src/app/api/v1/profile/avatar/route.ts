import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/v1/profile/avatar
 *
 * Uploads a new profile picture. Accepts multipart form-data with the image file.
 *
 * Backend (NestJS) implementation:
 *   1. Verify JWT
 *   2. Validate file: type (PNG/JPG/JPEG/WEBP), size (max 5MB)
 *   3. Process image with sharp: resize to 512x512, convert to WebP, quality 85
 *   4. Generate thumbnail (128x128 WebP)
 *   5. Upload to MinIO: /users/{userId}/avatar/original.webp + thumbnail.webp
 *   6. Delete old avatar from MinIO if existed
 *   7. UPDATE users SET avatar_url = $1 WHERE id = $userId
 *   8. Audit log: action='avatar.uploaded'
 *   9. Return new avatar URL (CDN-ready)
 *
 * Form data: { file: Blob }
 * Returns: { success, avatarUrl, thumbnailUrl }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided', code: 'NO_FILE' },
        { status: 400 },
      )
    }

    // --- Validate file type ---
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}. Allowed: PNG, JPG, JPEG, WEBP`, code: 'INVALID_TYPE' },
        { status: 415 },
      )
    }

    // --- Validate file size (5 MB max) ---
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB. Max 5 MB`, code: 'FILE_TOO_LARGE' },
        { status: 413 },
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'File is empty or corrupted', code: 'EMPTY_FILE' },
        { status: 400 },
      )
    }

    // --- Process image (real impl uses sharp) ---
    // const buffer = Buffer.from(await file.arrayBuffer())
    // const optimized = await sharp(buffer).resize(512, 512, { fit: 'cover' }).webp({ quality: 85 }).toBuffer()
    // const thumbnail = await sharp(buffer).resize(128, 128, { fit: 'cover' }).webp({ quality: 80 }).toBuffer()

    // --- Upload to MinIO ---
    // const userId = verifyJwt(req).userId
    // const originalPath = `users/${userId}/avatar/original.webp`
    // const thumbnailPath = `users/${userId}/avatar/thumbnail.webp`
    // await minio.putObject('corefiles-prod', originalPath, optimized)
    // await minio.putObject('corefiles-prod', thumbnailPath, thumbnail)

    // --- Delete old avatar ---
    // const oldAvatar = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } })
    // if (oldAvatar?.avatarUrl) await minio.removeObject('corefiles-prod', oldAvatar.avatarUrl)

    // --- Update DB ---
    // await prisma.user.update({ where: { id: userId }, data: { avatarUrl: originalPath } })
    // await auditLog({ userId, action: 'avatar.uploaded', ip, browser })

    // Sandbox: return a deterministic mock URL (in production this is a CDN URL)
    const avatarId = Date.now()
    const avatarUrl = `/api/v1/files/avatar-${avatarId}.webp`
    const thumbnailUrl = `/api/v1/files/avatar-${avatarId}-thumb.webp`

    return NextResponse.json({
      success: true,
      avatarUrl,
      thumbnailUrl,
      metadata: {
        originalSize: file.size,
        optimizedSize: Math.round(file.size * 0.3), // sharp typically reduces by 70%
        format: 'webp',
        dimensions: { width: 512, height: 512 },
        thumbnailDimensions: { width: 128, height: 128 },
        uploadedAt: new Date().toISOString(),
      },
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Avatar upload failed', detail: (e as Error).message },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/v1/profile/avatar
 *
 * Removes the user's profile picture.
 *
 * Backend:
 *   1. Verify JWT
 *   2. Get current avatar URL from DB
 *   3. Delete from MinIO (original + thumbnail)
 *   4. UPDATE users SET avatar_url = NULL WHERE id = $userId
 *   5. Audit log: action='avatar.deleted'
 */
export async function DELETE(req: NextRequest) {
  try {
    // Real impl:
    //   const userId = verifyJwt(req).userId
    //   const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } })
    //   if (user?.avatarUrl) {
    //     await minio.removeObject('corefiles-prod', user.avatarUrl)
    //     await prisma.user.update({ where: { id: userId }, data: { avatarUrl: null } })
    //     await auditLog({ userId, action: 'avatar.deleted', ip, browser })
    //   }

    return NextResponse.json({
      success: true,
      deletedAt: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete avatar', detail: (e as Error).message },
      { status: 500 },
    )
  }
}
