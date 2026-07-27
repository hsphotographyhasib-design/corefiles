/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * PUT /api/v1/profile/password
 *
 * Changes the user's password.
 *
 * Backend (NestJS) implementation:
 *   1. Verify JWT
 *   2. Get user's current password_hash from DB
 *   3. Compare currentPassword using bcrypt.compare()
 *   4. Validate newPassword strength (min 12 chars, upper, lower, number, symbol)
 *   5. Hash newPassword with bcrypt (cost 12)
 *   6. UPDATE users SET password_hash = $1, password_changed_at = NOW() WHERE id = $userId
 *   7. Invalidate all other sessions (DELETE FROM sessions WHERE user_id = $1 AND id != $current)
 *   8. Audit log: action='password.changed'
 *   9. Send email notification to user
 *
 * Body: { currentPassword, newPassword }
 * Returns: { success, auditLogId }
 */
export async function PUT(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current and new password are required', code: 'MISSING_FIELDS' },
        { status: 400 },
      )
    }

    // --- Validate new password strength ---
    const strength = computePasswordStrength(newPassword)
    if (strength.score < 3) {
      return NextResponse.json(
        { success: false, error: 'Password too weak. Use 12+ chars with upper, lower, number, and symbol', code: 'WEAK_PASSWORD', strength },
        { status: 422 },
      )
    }

    // --- Verify current password (real impl: bcrypt.compare) ---
    // const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } })
    // const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    // if (!valid) return 401 "Current password incorrect"

    // --- Hash + update ---
    // const newHash = await bcrypt.hash(newPassword, 12)
    // await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash, passwordChangedAt: new Date() } })
    // await prisma.session.deleteMany({ where: { userId, NOT: { id: currentSessionId } } })
    // await auditLog({ userId, action: 'password.changed', ip, browser })

    return NextResponse.json({
      success: true,
      auditLogId: `al_${Date.now()}`,
      strength,
      sessionsTerminated: 0,
      changedAt: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Password change failed', detail: (e as Error).message },
      { status: 500 },
    )
  }
}

/** Compute password strength score (0-4) + feedback. */
function computePasswordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; feedback: string[] } {
  const feedback: string[] = []
  if (pw.length < 12) feedback.push('Use at least 12 characters')
  if (!/[A-Z]/.test(pw)) feedback.push('Add uppercase letters')
  if (!/[a-z]/.test(pw)) feedback.push('Add lowercase letters')
  if (!/[0-9]/.test(pw)) feedback.push('Add numbers')
  if (!/[^A-Za-z0-9]/.test(pw)) feedback.push('Add symbols (!@#$...)')

  let score: 0 | 1 | 2 | 3 | 4 = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++

  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong']
  return { score, label: labels[score], feedback }
}
