import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
)

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: true, message: 'Téléchargement simulé (Supabase non configuré)' })
    }
    const body = await request.json()
    const {
      galleryId,
      mediaId,
      mediaType,
      fileName,
      fileUrl,
      viewerName,
      viewerEmail,
      viewerUserId,
      viewerKey,
    } = body || {}

    if (!galleryId || !mediaType) {
      return NextResponse.json({ error: 'galleryId et mediaType sont requis' }, { status: 400 })
    }

    const normalizedEmail = typeof viewerEmail === 'string' ? viewerEmail.trim().toLowerCase() : ''
    if (!normalizedEmail && !viewerKey) {
      return NextResponse.json({ error: 'viewerEmail ou viewerKey requis pour enregistrer l’activité' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const finalViewerKey = viewerKey || normalizedEmail
    const isMissingColumnError = (error: any) => error?.code === '42703' || /column .*viewer_key.* does not exist|viewer_key.*does not exist/i.test(error?.message || '')

    const visitorPayloadBase = {
      gallery_id: galleryId,
      viewer_email: normalizedEmail || viewerEmail || 'inconnu@local',
      viewer_name: viewerName || null,
      viewer_user_id: viewerUserId || null,
      viewer_ip: ip,
      user_agent: userAgent,
      last_seen_at: new Date().toISOString(),
    }

    const visitorPayloadWithKey = {
      ...visitorPayloadBase,
      viewer_key: finalViewerKey,
    }

    let visitorError: any = null
    try {
      const upsertRes = await supabase
        .from('gallery_visitors')
        .upsert(
          visitorPayloadWithKey,
          { onConflict: 'gallery_id,viewer_key' }
        )
      visitorError = upsertRes.error
    } catch (error) {
      visitorError = error
    }

    if (visitorError && isMissingColumnError(visitorError)) {
      const fallbackUpsert = await supabase
        .from('gallery_visitors')
        .upsert(
          {
            ...visitorPayloadBase,
            viewer_key: finalViewerKey,
          },
          { onConflict: 'gallery_id,viewer_key' }
        )
      visitorError = fallbackUpsert.error
    }

    if (visitorError) {
      console.error('Erreur visitor download:', visitorError)
      return NextResponse.json({ error: visitorError.message }, { status: 500 })
    }

    const payload = {
      gallery_id: galleryId,
      media_id: mediaId || null,
      media_type: mediaType,
      file_name: fileName || null,
      file_url: fileUrl || null,
      viewer_name: viewerName || null,
      viewer_email: normalizedEmail || viewerEmail || null,
      viewer_user_id: viewerUserId || null,
      viewer_ip: ip,
      user_agent: userAgent,
    }

    const payloadWithKey = {
      ...payload,
      viewer_key: finalViewerKey,
    }

    let insertError: any = null
    try {
      const insertRes = await supabase.from('gallery_downloads').insert([payloadWithKey])
      insertError = insertRes.error
    } catch (error) {
      insertError = error
    }

    if (insertError && isMissingColumnError(insertError)) {
      const fallbackInsert = await supabase.from('gallery_downloads').insert([payload])
      insertError = fallbackInsert.error
    }

    if (insertError) {
      console.error('Erreur log download:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Téléchargement enregistré' })
  } catch (error: any) {
    console.error('Erreur route download:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
