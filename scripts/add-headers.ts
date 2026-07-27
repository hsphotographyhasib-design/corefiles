/**
 * Copyright header applier — adds the standard CoreFiles copyright
 * to the top of every .ts/.tsx file in src/ that doesn't have it.
 *
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * Developer: amdsaib96
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const HEADER = `/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

`

const SRC_DIR = join(process.cwd(), 'src')
const EXTS = ['.ts', '.tsx']
const SKIP = ['node_modules', '.next', 'dist', 'build']

function walk(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    if (SKIP.includes(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      files.push(...walk(full))
    } else if (EXTS.includes(extname(full))) {
      files.push(full)
    }
  }
  return files
}

let added = 0
let skipped = 0
for (const file of walk(SRC_DIR)) {
  const content = readFileSync(file, 'utf-8')
  if (content.startsWith('/**\n * Copyright (c) 2026 Hasanur Jaya')) {
    skipped++
    continue
  }
  // Skip if already has any copyright comment in first 5 lines
  const firstLines = content.split('\n').slice(0, 5).join('\n')
  if (firstLines.includes('Copyright (c) 2026 Hasanur Jaya')) {
    skipped++
    continue
  }
  writeFileSync(file, HEADER + content)
  added++
}

console.log(`[headers] Added to ${added} files, skipped ${skipped} (already had header)`)
