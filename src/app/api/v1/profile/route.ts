import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/v1/profile
 *
 * Returns the authenticated user's full profile.
 *
 * Backend (NestJS) implementation:
 *   1. Extract userId from JWT
 *   2. SELECT * FROM users WHERE id = $1
 *   3. Join with departments, roles
 *   4. Return sanitized profile (no password_hash)
 *
 * Returns: full UserProfile object
 */
export async function GET(req: NextRequest) {
  // Real impl: const userId = verifyJwt(req).userId
  //           const user = await prisma.user.findUnique({ where: { id: userId }, include: { department: true, role: true } })
  const profile = {
    id: 'u-1',
    firstName: 'Hasan',
    lastName: 'Rahman',
    displayName: 'Hasan Rahman',
    username: 'hasan.rahman',
    email: 'hasan@hasanurjaya.com',
    role: 'Super Admin',
    employeeId: 'HJ-001',
    jobTitle: 'Chief Executive Officer',
    department: 'Administration',
    company: 'Hasanur Jaya Sdn. Bhd.',
    bio: 'Founder & CEO of Hasanur Jaya Sdn. Bhd. — building Malaysia\'s most reliable engineering document management platform.',
    timezone: 'Asia/Kuala_Lumpur',
    language: 'en',
    phone: '+60 3-8941 2000',
    mobile: '+60 12-345 6789',
    whatsapp: '+60 12-345 6789',
    officeExtension: '1001',
    address: 'Level 12, Menara CIMB, Jalan Stesen Sentral 5',
    city: 'Kuala Lumpur',
    state: 'Wilayah Persekutuan',
    country: 'Malaysia',
    postalCode: '50470',
    twoFactorEnabled: true,
    recoveryEmail: 'hasan.backup@gmail.com',
    theme: 'system',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    defaultLandingPage: 'dashboard',
    profileVisibility: 'organization',
    notifEmail: true,
    notifPush: true,
    notifSecurityAlerts: true,
    notifUploads: true,
    notifMentions: true,
    notifSystemUpdates: false,
    storageUsedBytes: 4_200_000_000,
    storageQuotaBytes: 50_000_000_000,
    createdAt: '2024-11-15T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
  }
  return NextResponse.json({ success: true, profile })
}

/**
 * PUT /api/v1/profile
 *
 * Updates the authenticated user's profile.
 *
 * Backend (NestJS) implementation:
 *   1. Verify JWT
 *   2. Validate all fields (email format, phone, username uniqueness, etc.)
 *   3. UPDATE users SET ... WHERE id = $1
 *   4. Insert into audit_logs: action='profile.updated', old/new values
 *   5. Return updated profile
 *
 * Body: Partial<UserProfile>
 * Returns: { success, profile, auditLogId }
 */
export async function PUT(req: NextRequest) {
  try {
    const updates = await req.json()

    // --- Server-side validation (never trust client) ---
    const errors: { field: string; message: string }[] = []

    if (updates.email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
        errors.push({ field: 'email', message: 'Invalid email format' })
      }
      // Real impl: SELECT id FROM users WHERE email = $1 AND id != $currentUserId
      if (updates.email === 'taken@example.com') {
        errors.push({ field: 'email', message: 'Email already in use' })
      }
    }

    if (updates.username !== undefined) {
      if (!/^[a-zA-Z0-9._-]{3,30}$/.test(updates.username)) {
        errors.push({ field: 'username', message: 'Username must be 3-30 chars: letters, numbers, . _ -' })
      }
      // Real impl: SELECT id FROM users WHERE username = $1 AND id != $currentUserId
      if (updates.username === 'admin') {
        errors.push({ field: 'username', message: 'Username already taken' })
      }
    }

    if (updates.phone !== undefined && updates.phone) {
      if (!/^\+?[\d\s\-\(\)]{7,20}$/.test(updates.phone)) {
        errors.push({ field: 'phone', message: 'Invalid phone number' })
      }
    }

    if (updates.bio !== undefined && updates.bio.length > 500) {
      errors.push({ field: 'bio', message: 'Bio must be under 500 characters' })
    }

    if (updates.displayName !== undefined && updates.displayName.trim().length < 2) {
      errors.push({ field: 'displayName', message: 'Display name must be at least 2 characters' })
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 422 })
    }

    // --- Update database ---
    // Real impl: await prisma.user.update({ where: { id: userId }, data: updates })
    // await auditLog({ userId, action: 'profile.updated', oldValue, newValue, ip, browser })

    return NextResponse.json({
      success: true,
      profile: { ...updates, id: 'u-1', updatedAt: new Date().toISOString() },
      auditLogId: `al_${Date.now()}`,
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to update profile', detail: (e as Error).message },
      { status: 500 },
    )
  }
}
