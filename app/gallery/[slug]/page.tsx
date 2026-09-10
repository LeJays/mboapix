'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Download, Heart, Share2, Loader2, X, ChevronLeft, ChevronRight, Check, ArrowDownToLine } from 'lucide-react'

// ─── DESIGN SYSTEM ───────────────────────────────────────────────────────────

type ColorPalette    = 'Light'|'Gold'|'Rose'|'Terracotta'|'Sand'|'Olive'|'Agave'|'Sea'|'Dark'
type TypographyStyle = 'Sans'|'Serif'|'Modern'|'Timeless'|'Bold'|'Subtle'
type ThumbnailSize   = 'Regular'|'Large'
type GridSpacing     = 'Regular'|'Large'
type NavigationStyle = 'Icon Only'|'Icon & Text'
type CoverStyle      = 'Center'|'Love'|'Left'|'Novel'|'Vintage'|'Frame'|'Stripe'|'Divider'|'Journal'|'Stamp'|'Outline'|'Classic'|'None'

const typographyConfig: Record<TypographyStyle, string> = {
  Sans:     'font-sans tracking-normal',
  Serif:    'font-serif tracking-normal',
  Modern:   'font-sans tracking-[0.2em] font-light uppercase',
  Timeless: 'font-serif italic tracking-wide font-light',
  Bold:     'font-sans font-black uppercase tracking-tighter',
  Subtle:   'font-sans font-thin tracking-[0.3em] uppercase opacity-70',
}

const colorConfigs: Record<ColorPalette,{ bg:string; accent:string; text:string; border:string }> = {
  Light:      { bg:'#FFFFFF', accent:'#EA580C', text:'#111827', border:'#F3F4F6' },
  Gold:       { bg:'#FAF9F6', accent:'#A68966', text:'#433422', border:'#EFEBE5' },
  Rose:       { bg:'#FFF9F9', accent:'#A67B7B', text:'#4A3535', border:'#F5E8E8' },
  Terracotta: { bg:'#FDF8F5', accent:'#A66D4F', text:'#4A2E1F', border:'#F2E3DB' },
  Sand:       { bg:'#F9F7F5', accent:'#8C7A6B', text:'#3D352F', border:'#EEEAE6' },
  Olive:      { bg:'#F9FAF7', accent:'#8C9475', text:'#383D2E', border:'#EDF0E6' },
  Agave:      { bg:'#F7F9F8', accent:'#789489', text:'#2E3D38', border:'#E6EFEA' },
  Sea:        { bg:'#F6F7F9', accent:'#7D8494', text:'#2E323D', border:'#E6E9EF' },
  Dark:       { bg:'#080808', accent:'#EA580C', text:'#FFFFFF', border:'#1F2937' },
}

const gridConfig = {
  columns: { Regular:'columns-2 sm:columns-3 lg:columns-4', Large:'columns-1 sm:columns-2 lg:columns-2' },
  gap:     { Regular:'gap-1 space-y-1',                     Large:'gap-6 space-y-6' },
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Colors  = { bg:string; accent:string; text:string; border:string }
type Gallery = {
  id:string; event_name:string; cover_url?:string
  is_published?:boolean
  is_protected?:boolean
  password?:string | null
  theme?:any
  profiles?:{ avatar_url?:string; full_name?:string }
}
type Photo = { id?:string; name?:string; url:string }
type PendingAction = 'favorite-gallery'|'download-gallery'|'favorite-photo'|'download-photo'

// ─── COVER HELPERS ───────────────────────────────────────────────────────────

function CoverBg({
  src, children, overlay = 'bg-black/30'
}: { src?:string; children:React.ReactNode; overlay?:string }) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {src && <img src={src} className="absolute inset-0 w-full h-full object-cover scale-[1.02] transition-transform duration-[10s] hover:scale-100" alt="" />}
      <div className={`absolute inset-0 ${overlay}`} />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  )
}

function Line({ color = 'white', opacity = 40, width = 10 }: { color?:string; opacity?:number; width?:number }) {
  return <div className={`h-[1px] mb-6`} style={{ width, backgroundColor: color === 'white' ? `rgba(255,255,255,0.${opacity})` : color }} />
}

// ─── COVER STYLES ────────────────────────────────────────────────────────────

function Cover({ gallery, coverStyle, typo, colors }: {
  gallery:Gallery; coverStyle:Exclude<CoverStyle,'None'>; typo:string; colors:Colors
}) {
  const name    = gallery.event_name
  const studio  = gallery.profiles?.full_name || ''
  const img     = gallery.cover_url

  /* ── CENTER ── */
  if (coverStyle === 'Center') return (
    <CoverBg src={img} overlay="bg-gradient-to-b from-black/5 via-transparent to-black/70">
      <div className="flex flex-col items-center justify-end h-full pb-20 text-center px-8">
        <p className={`text-white/50 text-[9px] uppercase tracking-[0.5em] mb-5 ${typo}`}>{studio}</p>
        <Line />
        <h1 className={`text-5xl md:text-7xl text-white leading-none ${typo}`}>{name}</h1>
      </div>
    </CoverBg>
  )

  /* ── LEFT ── */
  if (coverStyle === 'Left') return (
    <CoverBg src={img} overlay="bg-gradient-to-r from-black/65 via-black/20 to-transparent">
      <div className="flex flex-col justify-end h-full pb-20 pl-12 md:pl-24">
        <p className={`text-white/50 text-[9px] uppercase tracking-[0.5em] mb-4 ${typo}`}>{studio}</p>
        <Line />
        <h1 className={`text-4xl md:text-6xl text-white leading-tight max-w-lg ${typo}`}>{name}</h1>
      </div>
    </CoverBg>
  )

  /* ── STRIPE ── */
  if (coverStyle === 'Stripe') return (
    <CoverBg src={img} overlay="bg-black/25">
      <div className="flex flex-col items-center justify-center h-full px-8">
        <div className="w-full max-w-3xl text-center py-10 px-12"
          style={{ borderTop:'1px solid rgba(255,255,255,0.25)', borderBottom:'1px solid rgba(255,255,255,0.25)', backdropFilter:'blur(6px)', backgroundColor:'rgba(0,0,0,0.2)' }}>
          <h1 className={`text-4xl md:text-6xl text-white ${typo}`}>{name}</h1>
          <p className={`text-white/50 text-[9px] uppercase tracking-[0.5em] mt-5 ${typo}`}>{studio}</p>
        </div>
      </div>
    </CoverBg>
  )

  /* ── OUTLINE ── */
  if (coverStyle === 'Outline') return (
    <CoverBg src={img} overlay="bg-black/35">
      <div className="flex items-center justify-center h-full p-10 md:p-20">
        <div className="border border-white/45 p-10 md:p-16 text-center max-w-xl w-full">
          <h1 className={`text-4xl md:text-6xl text-white ${typo}`}>{name}</h1>
          <div className="w-8 h-[1px] bg-white/40 mx-auto mt-7 mb-5" />
          <p className={`text-white/45 text-[9px] uppercase tracking-[0.45em] ${typo}`}>{studio}</p>
        </div>
      </div>
    </CoverBg>
  )

  /* ── CLASSIC ── */
  if (coverStyle === 'Classic') return (
    <CoverBg src={img} overlay="bg-gradient-to-t from-black/80 via-black/10 to-transparent">
      <div className="flex flex-col items-center justify-end h-full pb-24 text-center px-8">
        <p className={`text-white/45 text-[9px] uppercase tracking-[0.5em] mb-4 ${typo}`}>{studio}</p>
        <h1 className={`text-5xl md:text-7xl text-white ${typo}`}>{name}</h1>
        <div className="w-8 h-[1px] bg-white/35 mt-7" />
      </div>
    </CoverBg>
  )

  /* ── LOVE ── */
  if (coverStyle === 'Love') return (
    <CoverBg src={img} overlay="bg-black/45">
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-8">
        <p className={`text-white/35 text-[9px] uppercase tracking-[0.6em] ${typo}`}>{studio}</p>
        <h1 className={`text-[22vw] md:text-[16vw] leading-none text-white/90 ${typo}`}>LOVE</h1>
        <p className={`text-white/65 text-xl md:text-2xl ${typo}`}>{name}</p>
      </div>
    </CoverBg>
  )

  /* ── NOVEL ── */
  if (coverStyle === 'Novel') return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      <div className="flex flex-col justify-between p-10 md:p-16 md:w-[38%] shrink-0"
        style={{ backgroundColor:colors.bg }}>
        <p className={`text-[9px] uppercase tracking-[0.5em] ${typo}`} style={{ color:`${colors.text}55` }}>{studio}</p>
        <div>
          <div className="w-10 h-[1px] mb-6" style={{ backgroundColor:colors.accent }} />
          <h1 className={`text-4xl md:text-5xl leading-tight ${typo}`} style={{ color:colors.text }}>{name}</h1>
        </div>
        <p className={`text-[9px] uppercase tracking-[0.4em] ${typo}`} style={{ color:`${colors.text}33` }}>Collection</p>
      </div>
      <div className="flex-1 relative overflow-hidden">
        {img && <img src={img} className="w-full h-full object-cover" alt="" />}
      </div>
    </div>
  )

  /* ── VINTAGE ── */
  if (coverStyle === 'Vintage') return (
    <CoverBg src={img} overlay="bg-[#3d2b1f]/50">
      <div className="flex items-center justify-center h-full px-8">
        <div className="text-center">
          <p className={`text-white/40 text-[8px] uppercase tracking-[0.8em] mb-6 ${typo}`}>— {studio} —</p>
          <div className="w-8 h-[1px] bg-white/35 mx-auto mb-7" />
          <h1 className={`text-5xl md:text-7xl text-white ${typo}`}>{name}</h1>
          <div className="w-8 h-[1px] bg-white/35 mx-auto mt-7 mb-6" />
          <p className={`text-white/35 text-[8px] uppercase tracking-[0.8em] ${typo}`}>Est. Collection</p>
        </div>
      </div>
    </CoverBg>
  )

  /* ── FRAME ── */
  if (coverStyle === 'Frame') return (
    <div className="relative w-full h-screen overflow-hidden bg-white p-6 md:p-12">
      <div className="relative w-full h-full overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
        {img && <img src={img} className="w-full h-full object-cover" alt="" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
          <p className={`text-white/50 text-[9px] uppercase tracking-[0.5em] mb-3 ${typo}`}>{studio}</p>
          <h1 className={`text-4xl md:text-6xl text-white ${typo}`}>{name}</h1>
        </div>
      </div>
    </div>
  )

  /* ── DIVIDER ── */
  if (coverStyle === 'Divider') return (
    <div className="flex flex-col-reverse md:flex-row w-full h-screen">
      <div className="flex-1 relative overflow-hidden">
        {img && <img src={img} className="w-full h-full object-cover" alt="" />}
      </div>
      <div className="flex flex-col justify-between p-10 md:p-16 md:w-[38%] shrink-0"
        style={{ backgroundColor:colors.bg }}>
        <p className={`text-[9px] uppercase tracking-[0.5em] ${typo}`} style={{ color:`${colors.text}40` }}>Collection</p>
        <div>
          <h1 className={`text-4xl md:text-5xl leading-tight mb-6 ${typo}`} style={{ color:colors.text }}>{name}</h1>
          <div className="w-10 h-[1px]" style={{ backgroundColor:colors.accent }} />
        </div>
        <p className={`text-[9px] uppercase tracking-[0.4em] ${typo}`} style={{ color:`${colors.text}40` }}>{studio}</p>
      </div>
    </div>
  )

  /* ── JOURNAL ── */
  if (coverStyle === 'Journal') return (
    <CoverBg src={img} overlay="bg-gradient-to-br from-black/55 via-black/10 to-transparent">
      <div className="flex flex-col justify-start h-full p-10 md:p-16 pt-16 md:pt-20">
        <p className={`text-white/45 text-[9px] uppercase tracking-[0.5em] mb-3 ${typo}`}>{studio}</p>
        <div className="w-10 h-[1px] bg-white/40 mb-5" />
        <h1 className={`text-4xl md:text-6xl text-white leading-tight max-w-md ${typo}`}>{name}</h1>
      </div>
    </CoverBg>
  )

  /* ── STAMP ── */
  if (coverStyle === 'Stamp') return (
    <CoverBg src={img} overlay="bg-black/45">
      <div className="flex items-center justify-center h-full">
        <div className="border-2 border-white/60 rounded-full w-60 h-60 md:w-80 md:h-80 flex flex-col items-center justify-center text-center p-8"
          style={{ boxShadow:'0 0 0 1px rgba(255,255,255,0.15), 0 0 0 12px rgba(255,255,255,0.04), 0 0 80px rgba(0,0,0,0.4)' }}>
          <div className="w-6 h-[1px] bg-white/45 mb-5" />
          <h1 className={`text-lg md:text-2xl text-white leading-tight ${typo}`}>{name}</h1>
          <div className="w-6 h-[1px] bg-white/45 mt-5 mb-4" />
          <p className={`text-white/40 text-[8px] uppercase tracking-[0.4em] ${typo}`}>{studio}</p>
        </div>
      </div>
    </CoverBg>
  )

  return null
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function PublicGalleryView() {
  const params       = useParams<{ slug:string }>()
  const searchParams = useSearchParams()
  const isPreview    = searchParams.get('preview') === 'true'

  const [loading, setLoading] = useState(true)
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [photos,  setPhotos]  = useState<Photo[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [activePhoto, setActivePhoto] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [albumFavorited, setAlbumFavorited] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [pendingPhoto, setPendingPhoto] = useState<Photo | null>(null)
  const [viewerEmail, setViewerEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [galleryPassword, setGalleryPassword] = useState('')
  const [galleryPasswordError, setGalleryPasswordError] = useState('')
  const [isGalleryUnlocked, setIsGalleryUnlocked] = useState(false)
  const [downloadPinInput, setDownloadPinInput] = useState('')
  const [downloadPinError, setDownloadPinError] = useState('')
  const [pendingDownloadAction, setPendingDownloadAction] = useState<{ type:'gallery'|'photo'; photo?:Photo } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data:g } = await supabase
          .from('galleries').select('*, profiles(*)').eq('slug', params.slug).single()
        if (!g) throw new Error()
        if (!g.is_published && !isPreview) { setLoading(false); return }
        const { data:p } = await supabase
          .from('gallery_photos').select('*').eq('gallery_id', g.id).order('created_at', { ascending:false })
        setGallery(g); setPhotos(p || [])
        if (g.is_protected) {
          const savedUnlock = window.localStorage.getItem(`mboapix:gallery:${params.slug}:unlocked`)
          setIsGalleryUnlocked(savedUnlock === 'true')
        } else {
          setIsGalleryUnlocked(true)
        }
      } catch { /* handled below */ }
      finally { setLoading(false) }
    }
    if (params.slug) load()
  }, [params.slug, isPreview])

  if (loading) return (
    <div className="h-screen bg-[#080808] flex flex-col items-center justify-center gap-5">
      <Loader2 className="animate-spin text-orange-600" size={36} />
      <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30">MboaPix</p>
    </div>
  )

  if (!gallery) return (
    <div className="h-screen bg-[#080808] text-white/30 flex items-center justify-center text-[9px] uppercase tracking-[0.5em]">
      Collection non disponible
    </div>
  )

  const theme        = gallery.theme || {}
  const palette      = (theme.palette      || 'Light')     as ColorPalette
  const typography   = (theme.typography   || 'Sans')      as TypographyStyle
  const coverStyle   = (theme.coverStyle   || 'Center')    as CoverStyle
  const thumbnailSize= (theme.thumbnailSize|| 'Regular')   as ThumbnailSize
  const gridSpacing  = (theme.gridSpacing  || 'Regular')   as GridSpacing
  const navStyle     = (theme.navStyle     || 'Icon Only') as NavigationStyle
  const galleryIsProtected = Boolean(gallery.is_protected)
  const galleryPasswordValue = (gallery.password as string | null) || ''

  const colors = colorConfigs[palette] ?? colorConfigs.Light
  const typo   = typographyConfig[typography]
  const canFavorite = theme.enable_favorites !== false
  const canDownload = theme.enable_download !== false
  const requireEmailFavorites = theme.require_email_favorites === true
  const allowFavoriteNotes = theme.allow_favorite_notes !== false
  const downloadPinEnabled = theme.download_pin_enabled === true
  const downloadPin = theme.download_pin || ''

  const getViewerKey = (email:string) => email.trim().toLowerCase()

  const showNotice = (message:string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 2800)
  }

  const togglePhoto = (photo:Photo) => {
    const key = photo.id || photo.url
    setSelected((current) => current.includes(key) ? current.filter((id) => id !== key) : [...current, key])
  }

  const downloadPhoto = async (photo:Photo, email?:string) => {
    if (!email) return requestAction('download-photo', photo)
    if (!canDownload) return showNotice('Le téléchargement n’est pas disponible pour cette galerie.')
    if (downloadPinEnabled && downloadPin) {
      setPendingDownloadAction({ type: 'photo', photo })
      setDownloadPinInput('')
      setDownloadPinError('')
      return
    }
    const viewerKey = getViewerKey(email)
    await fetch('/api/download', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ galleryId:gallery.id, mediaId:photo.id, mediaType:'photo', fileName:photo.name, fileUrl:photo.url, viewerEmail:email, viewerKey }),
    }).catch(() => undefined)
    const link = document.createElement('a')
    link.href = photo.url
    link.download = photo.name || 'mboapix-photo'
    link.target = '_blank'
    link.rel = 'noreferrer'
    document.body.appendChild(link)
    link.click()
    link.remove()
    showNotice('Téléchargement lancé.')
  }

  const favoritePhoto = async (photo:Photo, email?:string) => {
    if (requireEmailFavorites && !email) return requestAction('favorite-photo', photo)
    if (!canFavorite) return showNotice('Les favoris ne sont pas activés pour cette galerie.')
    if (!allowFavoriteNotes && typeof photo === 'object') {
      showNotice('Les commentaires sur les favoris sont désactivés pour cette galerie.')
    }
    const viewerKey = email ? getViewerKey(email) : undefined
    await fetch('/api/favorite', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ galleryId:gallery.id, mediaId:photo.id, itemType:'photo', itemName:photo.name, viewerEmail:email, viewerKey }),
    }).catch(() => undefined)
    showNotice('Ajouté à vos favoris.')
  }

  const favoriteGallery = async (email?:string) => {
    if (requireEmailFavorites && !email) return requestAction('favorite-gallery')
    if (!canFavorite) return showNotice('Les favoris ne sont pas activés pour cette galerie.')
    const viewerKey = email ? getViewerKey(email) : undefined
    const response = await fetch('/api/favorite', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ galleryId:gallery.id, itemType:'gallery', itemName:gallery.event_name, viewerEmail:email, viewerKey }),
    }).catch(() => null)
    const result = response ? await response.json().catch(() => null) : null
    setAlbumFavorited(true)
    showNotice(result?.duplicate ? 'Cet album est déjà dans vos favoris.' : 'Album ajouté à vos favoris.')
  }

  const downloadGallery = async (email?:string) => {
    if (!email) return requestAction('download-gallery')
    if (!canDownload) return showNotice('Le téléchargement n’est pas disponible pour cette galerie.')
    if (downloadPinEnabled && downloadPin) {
      setPendingDownloadAction({ type: 'gallery' })
      setDownloadPinInput('')
      setDownloadPinError('')
      return
    }
    const viewerKey = getViewerKey(email)
    await fetch('/api/download', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({ galleryId:gallery.id, mediaType:'gallery', fileName:gallery.event_name, viewerEmail:email, viewerKey }),
    }).catch(() => undefined)

    photos.forEach((photo, index) => {
      window.setTimeout(() => {
        const link = document.createElement('a')
        link.href = photo.url
        link.download = photo.name || `${gallery.event_name}-${index + 1}`
        link.target = '_blank'
        link.rel = 'noreferrer'
        document.body.appendChild(link)
        link.click()
        link.remove()
      }, index * 150)
    })
    showNotice(`${photos.length} photo${photos.length > 1 ? 's' : ''} en cours de téléchargement.`)
  }

  const runAction = async (action:PendingAction, email:string, photo:Photo | null) => {
    if (action === 'favorite-gallery') await favoriteGallery(email)
    if (action === 'download-gallery') await downloadGallery(email)
    if (action === 'favorite-photo' && photo) await favoritePhoto(photo, email)
    if (action === 'download-photo' && photo) await downloadPhoto(photo, email)
  }

  const requestAction = (action:PendingAction, photo:Photo | null = null) => {
    const storageKey = `mboapix:viewer:${params.slug}`
    const savedEmail = window.localStorage.getItem(storageKey)
    if (savedEmail) {
      void runAction(action, savedEmail, photo)
      return
    }
    setPendingAction(action)
    setPendingPhoto(photo)
    setEmailError('')
  }

  const confirmViewer = async (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = viewerEmail.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Saisissez une adresse e-mail valide.')
      return
    }
    const viewerKey = getViewerKey(email)
    window.localStorage.setItem(`mboapix:viewer:${params.slug}`, email)
    window.localStorage.setItem(`mboapix:viewer:${params.slug}:key`, viewerKey)
    const action = pendingAction
    const photo = pendingPhoto
    setPendingAction(null)
    setPendingPhoto(null)
    if (action) await runAction(action, email, photo)
  }

  const submitGalleryPassword = (event: React.FormEvent) => {
    event.preventDefault()
    if (!galleryPasswordValue) {
      setGalleryPasswordError('Aucun mot de passe n’est configuré pour cette galerie.')
      return
    }
    if (galleryPassword.trim() !== galleryPasswordValue) {
      setGalleryPasswordError('Mot de passe incorrect.')
      return
    }
    setGalleryPasswordError('')
    setGalleryPassword('')
    setIsGalleryUnlocked(true)
    window.localStorage.setItem(`mboapix:gallery:${params.slug}:unlocked`, 'true')
  }

  const confirmDownloadPin = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!pendingDownloadAction) return

    if (downloadPinInput.trim() !== String(downloadPin).trim()) {
      setDownloadPinError('PIN incorrect.')
      return
    }

    const savedEmail = window.localStorage.getItem(`mboapix:viewer:${params.slug}`)
    setDownloadPinError('')
    setDownloadPinInput('')
    setPendingDownloadAction(null)

    if (pendingDownloadAction.type === 'gallery') {
      await downloadGallery(savedEmail || undefined)
      return
    }

    if (pendingDownloadAction.photo) {
      await downloadPhoto(pendingDownloadAction.photo, savedEmail || undefined)
    }
  }

  const shareGallery = async () => {
    const shareData = { title:gallery.event_name, text:`Découvrez ${gallery.event_name}`, url:window.location.href }
    try {
      if (navigator.share) await navigator.share(shareData)
      else { await navigator.clipboard.writeText(window.location.href); showNotice('Lien de la galerie copié.') }
    } catch { /* the visitor cancelled the share dialog */ }
  }

  if (galleryIsProtected && !isGalleryUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] px-6">
        <form onSubmit={submitGalleryPassword} className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8 text-white shadow-2xl backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Galerie protégée</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Mot de passe requis</h1>
          <input
            type="password"
            value={galleryPassword}
            onChange={(e) => setGalleryPassword(e.target.value)}
            placeholder="Saisissez le mot de passe"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-orange-500 outline-none"
          />
          {galleryPasswordError && <p className="mt-3 text-xs text-red-400">{galleryPasswordError}</p>}
          <button type="submit" className="mt-6 w-full rounded-2xl bg-orange-600 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white">
            Ouvrir la galerie
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden transition-colors duration-700" style={{ backgroundColor:colors.bg, color:colors.text }}>

      {/* BANDEAU PREVIEW */}
      {isPreview && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-orange-600 text-white text-[9px] font-black uppercase tracking-[0.5em] py-2 text-center">
          Aperçu — Non publiée
        </div>
      )}

      {/* COVER */}
      {coverStyle !== 'None' && (
        <Cover gallery={gallery} coverStyle={coverStyle} typo={typo} colors={colors} />
      )}

      {/* NAV STICKY */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-10 h-[68px] border-b transition-all duration-500"
        style={{ backgroundColor:`${colors.bg}E8`, borderColor:colors.border, backdropFilter:'blur(18px)' }}
      >
        {/* LEFT — avatar + nom galerie */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border"
            style={{ borderColor:colors.border, backgroundColor:colors.border }}>
            {gallery.profiles?.avatar_url
              ? <img src={gallery.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
              : <span className="w-full h-full flex items-center justify-center text-[10px] font-black" style={{ opacity:0.4 }}>
                  {gallery.profiles?.full_name?.charAt(0) || 'S'}
                </span>
            }
          </div>
          <div className="flex flex-col gap-1 leading-none">
            <span className={`text-[10px] font-medium uppercase tracking-[0.12em] ${typo}`} style={{ color:colors.text }}>{gallery.event_name}</span>
            {gallery.profiles?.full_name && (
              <span className={`text-[8px] uppercase tracking-[0.14em] ${typo}`} style={{ color:`${colors.text}55` }}>{gallery.profiles.full_name}</span>
            )}
          </div>
        </div>

        {/* RIGHT — actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {canFavorite && <button onClick={() => favoriteGallery()} aria-label="Ajouter l’album aux favoris" className="gallery-action" style={{ color:albumFavorited ? colors.accent : colors.text }}><Heart size={16} fill={albumFavorited ? 'currentColor' : 'none'} strokeWidth={1.5} />{navStyle === 'Icon & Text' && <span>Album favori</span>}</button>}
          {canDownload && <button onClick={() => downloadGallery()} aria-label="Télécharger l’album complet" className="gallery-action" style={{ color:colors.text }}><Download size={16} strokeWidth={1.5} />{navStyle === 'Icon & Text' && <span>Album complet</span>}</button>}
          <button onClick={shareGallery} aria-label="Partager la galerie" className="gallery-action" style={{ color:colors.text }}><Share2 size={16} strokeWidth={1.5} />{navStyle === 'Icon & Text' && <span>Partager</span>}</button>
        </div>
      </nav>

      {/* GRID PHOTOS */}
      <main className={gridSpacing === 'Regular' ? 'py-1' : 'px-4 py-10 md:px-10 md:py-16'}>
        <div className={gridSpacing === 'Regular' ? 'px-4 md:px-8 pb-6 flex items-end justify-between' : 'max-w-[1600px] mx-auto pb-8 flex items-end justify-between'}>
          <div><p className={`text-[9px] uppercase tracking-[0.28em] ${typo}`} style={{ color:`${colors.text}55` }}>La collection</p><p className="mt-2 text-sm" style={{ color:`${colors.text}80` }}>{photos.length} {photos.length > 1 ? 'souvenirs' : 'souvenir'} à découvrir</p></div>
          {selected.length > 0 && <button onClick={() => setSelected([])} className="text-[9px] uppercase tracking-[0.18em]" style={{ color:colors.accent }}>Effacer la sélection</button>}
        </div>
        <div className={`${gridConfig.columns[thumbnailSize]} ${gridConfig.gap[gridSpacing]} ${gridSpacing === 'Large' ? 'max-w-[1600px] mx-auto' : ''}`}>
          {photos.map((p, i) => (
            <article key={p.id || i} className="break-inside-avoid overflow-hidden group relative gallery-photo">
              <img
                src={p.url}
                className="w-full h-auto object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.025]"
                alt={p.name || `${gallery.event_name} — photo ${i + 1}`}
                loading="lazy"
              />
              <button onClick={() => setActivePhoto(i)} className="absolute inset-0 z-10 cursor-zoom-in" aria-label={`Voir ${p.name || `la photo ${i + 1}`}`} />
              <button onClick={(event) => { event.stopPropagation(); togglePhoto(p) }} className={`absolute top-3 right-3 z-20 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${selected.includes(p.id || p.url) ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`} style={{ backgroundColor:selected.includes(p.id || p.url) ? colors.accent : 'rgba(255,255,255,.9)', color:selected.includes(p.id || p.url) ? '#fff' : colors.text }} aria-label="Sélectionner cette photo">{selected.includes(p.id || p.url) ? <Check size={15} /> : <Heart size={15} strokeWidth={1.5} />}</button>
            </article>
          ))}
        </div>
        {photos.length === 0 && <div className="py-24 text-center text-sm opacity-50">Les photos arrivent bientôt.</div>}
      </main>

      {/* FOOTER */}
      <footer className="py-24 flex flex-col items-center gap-4 border-t" style={{ borderColor:colors.border }}>
        <div className="h-8 w-[1px]" style={{ backgroundColor:`${colors.text}20` }} />
        <p className={`text-[8px] uppercase tracking-[0.5em] ${typo}`} style={{ color:`${colors.text}30` }}>
          MboaPix — Digital Experience
        </p>
      </footer>

      {selected.length > 0 && <div className="fixed bottom-3 left-1/2 z-[60] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-full px-3 py-2 pl-4 shadow-2xl flex items-center justify-between gap-3" style={{ backgroundColor:colors.text, color:colors.bg }}><span className="text-[9px] sm:text-[10px] whitespace-nowrap">{selected.length} sélectionnée{selected.length > 1 ? 's' : ''}</span><button onClick={() => showNotice('Votre sélection est prête. Ouvrez chaque image pour la télécharger.')} className="rounded-full px-3 py-2 text-[8px] sm:text-[9px] uppercase tracking-[0.12em] flex items-center gap-2" style={{ backgroundColor:colors.accent, color:'#fff' }}><ArrowDownToLine size={14} /> Télécharger</button></div>}
      {downloadPinEnabled && <div className="fixed bottom-20 left-1/2 z-[55] -translate-x-1/2 rounded-full bg-black/80 px-3 py-2 text-[7px] sm:text-[8px] uppercase tracking-[0.22em] text-white/70">Téléchargement protégé — PIN actif</div>}
      {notice && <div className="fixed top-20 left-1/2 z-[80] -translate-x-1/2 rounded-full px-5 py-3 text-[11px] shadow-xl" style={{ backgroundColor:colors.text, color:colors.bg }}>{notice}</div>}
      {pendingAction && <div className="fixed inset-0 z-[100] flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="Identification du visiteur">
        <button onClick={() => setPendingAction(null)} className="absolute inset-0 bg-black/55 backdrop-blur-sm" aria-label="Fermer" />
        <form onSubmit={confirmViewer} className="relative w-full max-w-md rounded-[2rem] p-7 md:p-9 shadow-2xl" style={{ backgroundColor:colors.bg, color:colors.text }}>
          <button type="button" onClick={() => setPendingAction(null)} className="absolute top-4 right-4 p-2 opacity-50 hover:opacity-100" aria-label="Fermer"><X size={18} /></button>
          <p className="text-[9px] uppercase tracking-[0.24em]" style={{ color:colors.accent }}>Avant de continuer</p>
          <h2 className="mt-3 text-2xl font-medium">Où envoyer votre sélection ?</h2>
          <p className="mt-3 text-sm leading-6 opacity-60">Votre e-mail permet d’associer vos favoris et téléchargements à cette galerie. Il ne sera demandé qu’une fois sur cet appareil.</p>
          <label className="block mt-7 text-[10px] uppercase tracking-[0.15em] opacity-60" htmlFor="viewer-email">Adresse e-mail</label>
          <input id="viewer-email" type="email" autoComplete="email" autoFocus value={viewerEmail} onChange={(event) => { setViewerEmail(event.target.value); setEmailError('') }} placeholder="vous@exemple.com" className="mt-2 w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none" style={{ borderColor: emailError ? '#dc2626' : colors.border }} />
          {emailError && <p className="mt-2 text-xs text-red-600">{emailError}</p>}
          <button type="submit" className="mt-6 w-full rounded-xl py-3.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white" style={{ backgroundColor:colors.accent }}>Continuer</button>
          <p className="mt-4 text-center text-[10px] opacity-40">En continuant, vous acceptez que le studio enregistre cette activité.</p>
        </form>
      </div>}
      {activePhoto !== null && photos[activePhoto] && <div className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-4 md:p-8" role="dialog" aria-modal="true"><button onClick={() => setActivePhoto(null)} className="absolute top-5 right-5 z-10 p-3 text-white/80 hover:text-white" aria-label="Fermer"><X size={24} /></button>{activePhoto > 0 && <button onClick={() => setActivePhoto(activePhoto - 1)} className="absolute left-3 md:left-7 p-3 text-white/75 hover:text-white" aria-label="Photo précédente"><ChevronLeft size={28} /></button>}<img src={photos[activePhoto].url} alt={photos[activePhoto].name || ''} className="max-h-[82vh] max-w-[92vw] object-contain shadow-2xl" />{activePhoto < photos.length - 1 && <button onClick={() => setActivePhoto(activePhoto + 1)} className="absolute right-3 md:right-7 p-3 text-white/75 hover:text-white" aria-label="Photo suivante"><ChevronRight size={28} /></button>}<div className="absolute bottom-5 flex items-center gap-2 rounded-full bg-white/10 p-1.5 backdrop-blur-md">{canFavorite && <button onClick={() => favoritePhoto(photos[activePhoto])} className="modal-action" aria-label="Ajouter aux favoris"><Heart size={17} /></button>}{canDownload && <button onClick={() => downloadPhoto(photos[activePhoto])} className="modal-action" aria-label="Télécharger cette photo"><Download size={17} /></button>}<span className="px-2 text-[10px] text-white/60">{activePhoto + 1} / {photos.length}</span></div></div>}

    </div>
  )
}
