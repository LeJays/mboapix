'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Download, Heart, Loader2, X, ChevronLeft, ChevronRight, ArrowDownToLine } from 'lucide-react'
import GalleryPreview, {
  ColorPalette,
  TypographyStyle,
  ThumbnailSize,
  GridSpacing,
  NavigationStyle,
  CoverStyle,
  colorConfigs,
  typographyConfig,
} from '@/components/GalleryPreview'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type ThemeConfig = {
  show_logo?: boolean
  show_description?: boolean
  title_position?: 'left' | 'center'
  logo_position?: 'top-left' | 'top-center' | 'bottom-left'
  description_position?: 'bottom' | 'side'
  [key: string]: unknown
}
type Gallery = {
  id:string; event_name:string; cover_url?:string
  is_published?:boolean
  is_protected?:boolean
  password?:string | null
  theme?: ThemeConfig
  profiles?:{ avatar_url?:string; full_name?:string; description?:string | null }
}
type Photo = { id?:string; name?:string; url:string }
type PendingAction = 'favorite-gallery'|'download-gallery'|'favorite-photo'|'download-photo'


// ─── PAGE ────────────────────────────────────────────────────────────────────

function normalizeTheme(rawTheme: unknown) {
  if (!rawTheme) return {}
  if (typeof rawTheme === 'string') {
    try {
      return JSON.parse(rawTheme)
    } catch {
      return {}
    }
  }
  return rawTheme as Record<string, any>
}

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
          .from('galleries')
          .select('*, profiles:photographer_id ( full_name, avatar_url, description )')
          .eq('slug', params.slug)
          .single()
        if (!g) throw new Error()
        if (!g.is_published && !isPreview) { setLoading(false); return }
        const { data:p } = await supabase
          .from('gallery_photos').select('*').eq('gallery_id', g.id).order('created_at', { ascending:false })
        const normalizedGallery = { ...g, theme: normalizeTheme(g.theme) }
        setGallery(normalizedGallery); setPhotos(p || [])
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

  const theme        = normalizeTheme(gallery.theme)
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

      {/* GALERIE COMPLETE IDENTIQUE AU PREVIEW DU DESIGN */}
      <GalleryPreview
        gallery={gallery}
        photos={photos}
        theme={{
          ...theme,
          palette,
          typography,
          coverStyle,
          thumbnailSize,
          gridSpacing,
          navStyle,
          show_logo: theme.show_logo ?? true,
          show_description: theme.show_description ?? true,
          title_position: (theme.title_position as any) || 'center',
          logo_position: (theme.logo_position as any) || 'top-left',
          description_position: (theme.description_position as any) || 'bottom',
          cover_description: (theme.cover_description as any) || gallery.profiles?.description || '',
        }}
        showBrowserFrame={false}
        isFavorited={albumFavorited}
        selectedPhotos={selected}
        onPhotoClick={(i) => setActivePhoto(i)}
        onPhotoSelect={(p) => togglePhoto(p)}
        onFavorite={() => favoriteGallery()}
        onDownload={() => downloadGallery()}
        onShare={shareGallery}
      />

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
