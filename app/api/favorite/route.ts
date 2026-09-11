import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
)

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: true, duplicate: false, message: 'Favori simulé (Supabase non configuré)' })
    }
    const body = await request.json()
    const {
      galleryId,
      mediaId,
      itemType,
      itemName,
      viewerName,
      viewerEmail,
      viewerUserId,
      viewerKey,
    } = body || {}

    if (!galleryId || !itemType) {
      return NextResponse.json({ error: 'galleryId et itemType sont requis' }, { status: 400 })
    }

    const normalizedEmail = typeof viewerEmail === 'string' ? viewerEmail.trim().toLowerCase() : ''
    if (!normalizedEmail && !viewerKey) {
      return NextResponse.json({ error: 'viewerEmail ou viewerKey requis pour enregistrer l’activité' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const finalViewerKey = viewerKey || normalizedEmail

    const isMissingColumnError = (error: any) => error?.code === '42703' || /column .*viewer_key.* does not exist|viewer_key.*does not exist/i.test(error?.message || '')

    let existingRows: any[] | null = []
    let existingError: any = null

    try {
      let matchQuery = supabase
        .from('gallery_favorites')
        .select('id')
        .eq('gallery_id', galleryId)
        .eq('item_type', itemType)
        .eq('viewer_key', finalViewerKey)

      if (mediaId) {
        matchQuery = matchQuery.eq('media_id', mediaId)
      } else {
        matchQuery = matchQuery.is('media_id', null)
      }

      const res = await matchQuery
      existingRows = res.data || []
      existingError = res.error
    } catch (error) {
      existingError = error
    }

    if (existingError && isMissingColumnError(existingError)) {
      let fallbackQuery = supabase
        .from('gallery_favorites')
        .select('id')
        .eq('gallery_id', galleryId)
        .eq('item_type', itemType)

      if (mediaId) {
        fallbackQuery = fallbackQuery.eq('media_id', mediaId)
      } else {
        fallbackQuery = fallbackQuery.is('media_id', null)
      }

      if (normalizedEmail) {
        fallbackQuery = fallbackQuery.eq('viewer_email', normalizedEmail)
      }

      const fallback = await fallbackQuery
      existingRows = fallback.data || []
      existingError = fallback.error
    }

    if (existingError) {
      console.error('Erreur check favorite:', existingError)
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    if ((existingRows || []).length > 0) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: 'Déjà ajouté aux favoris',
      })
    }

    const visitorPayload = {
      gallery_id: galleryId,
      viewer_email: normalizedEmail || viewerEmail || 'inconnu@local',
      viewer_key: finalViewerKey,
      viewer_name: viewerName || null,
      viewer_user_id: viewerUserId || null,
      viewer_ip: ip,
      user_agent: userAgent,
      last_seen_at: new Date().toISOString(),
    }

    const visitorResponse = await supabase
      .from('gallery_visitors')
      .upsert(visitorPayload, { onConflict: 'gallery_id,viewer_key' })

    if (visitorResponse.error) {
      console.error('Erreur visitor favorite:', visitorResponse.error)
      return NextResponse.json({ error: visitorResponse.error.message }, { status: 500 })
    }

    const favoritePayload = {
      gallery_id: galleryId,
      media_id: mediaId || null,
      item_name: itemName || null,
      item_type: itemType,
      viewer_name: viewerName || null,
      viewer_email: normalizedEmail || viewerEmail || null,
      viewer_key: finalViewerKey,
      viewer_user_id: viewerUserId || null,
      viewer_ip: ip,
      user_agent: userAgent,
    }

    const insertResponse = await supabase.from('gallery_favorites').insert([favoritePayload])

    if (insertResponse.error) {
      console.error('Erreur log favorite:', insertResponse.error)
      return NextResponse.json({ error: insertResponse.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, duplicate: false, message: 'Favori enregistré' })
  } catch (error: any) {
    console.error('Erreur route favorite:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
