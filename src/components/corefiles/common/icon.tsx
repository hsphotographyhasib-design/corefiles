/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

'use client'

import * as React from 'react'
import {
  LayoutDashboard, FolderTree, Star, Clock, Trash2, Search, Users, Shield,
  Building2, Bell, FileText, ScrollText, BarChart3, Settings, Server,
  type LucideIcon,
} from 'lucide-react'

export const iconMap: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'folder-tree': FolderTree,
  star: Star,
  clock: Clock,
  'trash-2': Trash2,
  search: Search,
  users: Users,
  shield: Shield,
  building: Building2,
  bell: Bell,
  'file-text': FileText,
  'scroll-text': ScrollText,
  'bar-chart': BarChart3,
  settings: Settings,
  server: Server,
}

export function Icon({
  name,
  className,
  size = 18,
}: {
  name: string
  className?: string
  size?: number
}) {
  const Cmp = iconMap[name]
  if (!Cmp) return null
  return <Cmp className={className} size={size} />
}
