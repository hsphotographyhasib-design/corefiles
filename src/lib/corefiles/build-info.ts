/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

/**
 * Central build & ownership metadata for CoreFiles.
 *
 * Single source of truth — every other file reads from here.
 * Build script (`scripts/generate-build-info.ts`) regenerates the
 * `BUILD` constant at build time.
 *
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

export interface BuildInfo {
  /** Semantic version (e.g. "1.0.0") */
  version: string
  /** Unique build identifier (e.g. "build-2026-07-27-a1b2c3d") */
  buildId: string
  /** ISO timestamp of when this build was generated */
  buildTime: string
  /** Git commit hash (short) */
  gitCommit: string
  /** Git branch name */
  gitBranch: string
  /** Developer identifier */
  developer: string
  /** Application name */
  appName: string
  /** Company / vendor */
  company: string
  /** Copyright notice */
  copyright: string
  /** License identifier */
  license: string
  /** Homepage URL */
  homepage: string
  /** Repository URL */
  repository: string
}

export const BUILD_INFO: BuildInfo = {
  version: '1.0.0',
  buildId: 'build-2026-07-27-01a5f24',
  buildTime: '2026-07-27T10:30:00.000Z',
  gitCommit: '01a5f24',
  gitBranch: 'main',
  developer: 'amdsaib96',
  appName: 'CoreFiles',
  company: 'Hasanur Jaya Sdn. Bhd.',
  copyright: `Copyright (c) ${new Date().getFullYear()} Hasanur Jaya Sdn. Bhd.`,
  license: 'Proprietary — All Rights Reserved',
  homepage: 'https://corefiles.hasanurjaya.com',
  repository: 'https://github.com/hsphotographyhasib-design/corefiles',
}

/** Compact developer attribution for footers and small UI surfaces. */
export const ATTRIBUTION = `© ${new Date().getFullYear()} Hasanur Jaya Sdn. Bhd. · Developed by ${BUILD_INFO.developer}`

/** ASCII startup banner — logged once to console when the app boots. */
export const STARTUP_BANNER = `
======================================
  ${BUILD_INFO.appName} Enterprise
  Version ${BUILD_INFO.version}
  Build ${BUILD_INFO.buildId}
  Developer: ${BUILD_INFO.developer}
  ${BUILD_INFO.copyright}
======================================
`.trim()
