/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/v1/uploads/history?userId=...&limit=50&offset=0
 *
 * Returns upload history for a user. Backend joins files + activity_logs.
 *
 * Backend: 
 *   SELECT f.*, u.session_id, u.uploaded_at, u.duration_ms
 *   FROM files f
 *   JOIN upload_sessions u ON f.upload_session_id = u.id
 *   WHERE u.user_id = $1
 *   ORDER BY u.uploaded_at DESC
 *   LIMIT $2 OFFSET $3
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') || 'u-1'
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)
  const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0', 10)

  // Simulated history
  const history = Array.from({ length: Math.min(20, limit) }, (_, i) => ({
    id: `hist_${i + 1}`,
    fileId: `fl_hist_${i + 1}`,
    filename: ['ISO 9001 Quality Manual.pdf', 'Tower A — Electrical Layout.dwg', 'Invoice 2026-Q1.xlsx', 'Site Survey.mp4', 'Tender Document.pdf'][i % 5],
    size: Math.round(Math.random() * 50 * 1024 ** 2),
    mime: 'application/pdf',
    checksum: 'sha256:' + Math.random().toString(16).slice(2, 18).padStart(64, '0'),
    uploadedAt: new Date(Date.now() - i * 3600_000).toISOString(),
    durationMs: Math.round(Math.random() * 30000),
    status: i % 7 === 0 ? 'failed' : 'completed',
    virusScan: i % 7 === 0 ? 'skipped' : 'clean',
    folder: ['Administration/Policies', 'Projects/Drawings', 'Finance/Invoices', 'Projects/Videos', 'Projects/Tender'][i % 5],
    ipAddress: '203.106.84.12',
    browser: 'Chrome 138',
    device: 'MacBook Pro',
  }))

  return NextResponse.json({
    success: true,
    userId,
    history,
    pagination: { limit, offset, total: 1247, hasMore: offset + limit < 1247 },
  })
}
