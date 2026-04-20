import { prisma } from '@/lib/db/prisma'

export const SETTING_KEYS = [
  'site.titleTh',
  'site.titleEn',
  'site.supportEmail',
  'learn.defaultLocale',
  'learn.allowSelfEnroll',
] as const

export type SettingKey = (typeof SETTING_KEYS)[number]

export const SETTING_META: Record<SettingKey, { label: string; description: string; type: 'string' | 'boolean' | 'email' }> = {
  'site.titleTh': { label: 'ชื่อระบบ (ไทย)', description: 'แสดงใน sidebar และ title', type: 'string' },
  'site.titleEn': { label: 'ชื่อระบบ (อังกฤษ)', description: 'ใช้เมื่อ locale เป็น en', type: 'string' },
  'site.supportEmail': { label: 'อีเมลติดต่อ', description: 'ใช้ใน footer และ error pages', type: 'email' },
  'learn.defaultLocale': { label: 'ภาษาเริ่มต้น', description: 'th หรือ en', type: 'string' },
  'learn.allowSelfEnroll': { label: 'อนุญาตลงทะเบียนเอง', description: 'ผู้ใช้ลงหลักสูตรเองได้โดยไม่ต้องเชิญ', type: 'boolean' },
}

export const DEFAULT_SETTINGS: Record<SettingKey, string | boolean> = {
  'site.titleTh': 'Click Broker Learning',
  'site.titleEn': 'Click Broker Learning',
  'site.supportEmail': 'support@clickbroker.co.th',
  'learn.defaultLocale': 'th',
  'learn.allowSelfEnroll': false,
}

export async function getAllSettings(): Promise<Record<SettingKey, string | boolean>> {
  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: SETTING_KEYS as unknown as string[] } },
  })
  const merged: Record<string, string | boolean> = { ...DEFAULT_SETTINGS }
  for (const r of rows) {
    merged[r.key] = r.value as string | boolean
  }
  return merged as Record<SettingKey, string | boolean>
}
