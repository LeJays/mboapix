import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const galleryId = searchParams.get('galleryId')

    if (!galleryId) {
      return NextResponse.json({ error: 'galleryId requis' }, { status: 400 })
    }

    const [downloadsResult, favoritesResult] = await Promise.all([
      supabase
        .from('gallery_downloads')
        .select('*')
        .eq('gallery_id', galleryId)
        .order('downloaded_at', { ascending: false }),
      supabase
        .from('gallery_favorites')
        .select('*')
        .eq('gallery_id', galleryId)
        .order('favorited_at', { ascending: false }),
    ])

    if (downloadsResult.error) {
      console.error('Erreur lecture downloads:', downloadsResult.error)
      return NextResponse.json({ error: downloadsResult.error.message }, { status: 500 })
    }

    if (favoritesResult.error) {
      console.error('Erreur lecture favorites:', favoritesResult.error)
      return NextResponse.json({ error: favoritesResult.error.message }, { status: 500 })
    }

    return NextResponse.json({
      downloads: downloadsResult.data || [],
      favorites: favoritesResult.data || [],
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    console.error('Erreur route activity:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
