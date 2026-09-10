import { supabase } from '@/lib/supabase'

export type GalleryCorePayload = {
  galleryId: string
  eventName?: string
  slug?: string
  isProtected?: boolean
  password?: string | null
  theme?: Record<string, any>
}

export function normalizeGalleryTheme(theme: Record<string, any> = {}) {
  return {
    ...theme,
    updated_at: new Date().toISOString(),
  }
}

export async function saveGalleryData({
  galleryId,
  eventName,
  slug,
  isProtected = false,
  password,
  theme,
}: GalleryCorePayload) {
  const safeSlug = String(slug || '').trim()
  const safeEventName = String(eventName || '').trim()

  const payload = {
    slug: safeSlug,
    event_name: safeEventName || safeSlug,
    is_protected: Boolean(isProtected),
    password: Boolean(isProtected) ? password || '' : null,
    theme: normalizeGalleryTheme(theme || {}),
  }

  const { data, error } = await supabase
    .from('galleries')
    .update(payload)
    .eq('id', galleryId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
