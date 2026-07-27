/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/v1/profile/sessions
 *
 * Returns all active sessions for the authenticated user.
 *
 * Backend (NestJS) implementation:
 *   SELECT * FROM sessions WHERE user_id = $1 AND expires_at > NOW() ORDER BY last_active_at DESC
 *
 * Returns: array of sessions with device, browser, OS, IP, location, timestamps
 */
export async function GET(req: NextRequest) {
  // Real impl: query sessions table joined with users
  const sessions = [
    {
      id: 'sess_current',
      isCurrent: true,
      device: 'MacBook Pro 16"',
      browser: 'Chrome 138',
      os: 'macOS 14.5',
      ipAddress: '203.106.84.12',
      country: 'Malaysia',
      countryFlag: '🇲🇾',
      city: 'Kuala Lumpur',
      loginAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      lastActiveAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
    },
    {
      id: 'sess_2',
      isCurrent: false,
      device: 'iPhone 15 Pro',
      browser: 'Safari 18',
      os: 'iOS 18.1',
      ipAddress: '118.101.222.7',
      country: 'Malaysia',
      countryFlag: '🇲🇾',
      city: 'Kuala Lumpur',
      loginAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
      lastActiveAt: new Date(Date.now() - 30 * 60_000).toISOString(),
      expiresAt: new Date(Date.now() + 12 * 3600_000).toISOString(),
    },
    {
      id: 'sess_3',
      isCurrent: false,
      device: 'Dell OptiPlex',
      browser: 'Edge 138',
      os: 'Windows 11',
      ipAddress: '175.136.45.8',
      country: 'Singapore',
      countryFlag: '🇸🇬',
      city: 'Singapore',
      loginAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(),
      lastActiveAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
      expiresAt: new Date(Date.now() + 6 * 3600_000).toISOString(),
    },
    {
      id: 'sess_4',
      isCurrent: false,
      device: 'iPad Pro 12.9',
      browser: 'Safari 18',
      os: 'iPadOS 18.1',
      ipAddress: '203.106.84.12',
      country: 'Malaysia',
      countryFlag: '🇲🇾',
      city: 'Kuala Lumpur',
      loginAt: new Date(Date.now() - 7 * 24 * 3600_000).toISOString(),
      lastActiveAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(),
      expiresAt: new Date(Date.now() + 48 * 3600_000).toISOString(),
    },
  ]

  return NextResponse.json({ success: true, sessions })
}

/**
 * DELETE /api/v1/profile/sessions/{id}
 *
 * Terminates a specific session (or all if id='all').
 *
 * Backend:
 *   1. Verify JWT
 *   2. If id='all': DELETE FROM sessions WHERE user_id = $1 AND id != $currentSessionId
 *      Else: DELETE FROM sessions WHERE id = $1 AND user_id = $1
 *   3. Audit log: action='session.terminated'
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // Real impl:
  //   if (id === 'all') {
  //     await prisma.session.deleteMany({ where: { userId, NOT: { id: currentSessionId } } })
  //   } else {
  //     await prisma.session.delete({ where: { id, userId } })
  //   }
  //   await auditLog({ userId, action: 'session.terminated', resourceId: id, ip, browser })

  return NextResponse.json({
    success: true,
    terminatedSessionId: id,
    terminatedAt: new Date().toISOString(),
    terminatedAll: id === 'all',
  })
}
