import { supabase } from '@/lib/supabase'

export type DownloadStats = {
  total: number
  uniqueClients: number
  latest: Array<{
    id: string
    viewer_email: string | null
    media_type: string
    file_name: string | null
    file_url: string | null
    downloaded_at: string
  }>
}

export async function fetchGalleryDownloads(galleryId: string) {
  const { data, error } = await supabase
    .from('gallery_downloads')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('downloaded_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function fetchDownloadStats(galleryId: string): Promise<DownloadStats> {
  const { data, error } = await supabase
    .from('gallery_downloads')
    .select('viewer_email, media_type, file_name, file_url, downloaded_at')
    .eq('gallery_id', galleryId)
    .order('downloaded_at', { ascending: false })

  if (error) {
    throw error
  }

  const list = data || []

  return {
    total: list.length,
    uniqueClients: new Set(list.map((item) => item.viewer_email || 'anonyme')).size,
    latest: list.slice(0, 10).map((item) => ({
      id: `${item.file_name}-${item.downloaded_at}`,
      viewer_email: item.viewer_email,
      media_type: item.media_type,
      file_name: item.file_name,
      file_url: item.file_url,
      downloaded_at: item.downloaded_at,
    })),
  }
}
