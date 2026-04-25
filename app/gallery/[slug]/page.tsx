'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Download, Heart, Share2, Loader2 } from 'lucide-react'

// TYPO
const typographyConfig = {
  Sans: 'font-sans',
  Serif: 'font-serif',
  Mono: 'font-mono',
  Display: 'font-black uppercase tracking-tighter',
  Elegant: 'font-light italic serif',
} as const

// COLORS
const colorConfigs = {
  Dark: { bg: '#030303', text: '#ffffff', border: '#ffffff10', accent: '#ea580c' },
  Light: { bg: '#ffffff', text: '#000000', border: '#00000010', accent: '#ea580c' },
  Soft: { bg: '#f8f9fa', text: '#1a1a1a', border: '#00000005', accent: '#000000' },
  Luxury: { bg: '#0a0a0a', text: '#d4af37', border: '#d4af3720', accent: '#d4af37' },
} as const

// GRID
const gridConfig = {
  columns: {
    Regular: 'columns-2 sm:columns-3 lg:columns-4',
    Large: 'columns-1 sm:columns-2 lg:columns-2'
  },
  gap: {
    Regular: 'gap-1 space-y-1',
    Large: 'gap-8 space-y-8'
  }
}

// TYPES
type ThumbnailSize = 'Regular' | 'Large'
type GridSpacing = 'Regular' | 'Large'

type Gallery = {
  id: string
  event_name: string
  event_date?: string
  cover_url?: string
  is_published?: boolean
  profiles?: {
    avatar_url?: string
    full_name?: string
  }
  theme?: any
}

type Photo = {
  url: string
}

// ✅ HERO COMPONENT (SORTI DU RENDER)
type HeroProps = {
  gallery: Gallery
  dark?: boolean
}

function HeroContent({ gallery, dark = false }: HeroProps) {
  return (
    <div className="space-y-4">
      <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${dark ? 'text-black' : 'text-orange-600'}`}>
        {gallery.event_date || 'Collection'}
      </p>

      <h1 className={`text-6xl md:text-[8vw] font-black italic uppercase ${dark ? 'text-black' : 'text-white'}`}>
        {gallery.event_name}
      </h1>
    </div>
  )
}

export default function PublicGalleryView() {
  const params = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'

  const [loading, setLoading] = useState(true)
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    const fetchFullGallery = async () => {
      try {
        const { data: g } = await supabase
          .from('galleries')
          .select('*, profiles(*)')
          .eq('slug', params.slug)
          .single()

        if (!g) throw new Error('Galerie introuvable')

        if (!g.is_published && !isPreview) {
          setLoading(false)
          return
        }

        const { data: p } = await supabase
          .from('gallery_photos')
          .select('*')
          .eq('gallery_id', g.id)
          .order('created_at', { ascending: false })

        setGallery(g)
        setPhotos(p || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) fetchFullGallery()
  }, [params.slug, isPreview])

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-orange-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
        MboaPix Loading
      </p>
    </div>
  )

  if (!gallery) return (
    <div className="h-screen bg-black text-white flex items-center justify-center italic uppercase tracking-widest text-[10px]">
      Collection non disponible
    </div>
  )

  const theme = gallery.theme || {}

  const palette = theme.palette || 'Dark'
  const typography = theme.typography || 'Sans'
  const coverStyle = theme.coverStyle || 'Center'
  const thumbnailSize = (theme.thumbnailSize || 'Regular') as ThumbnailSize
  const gridSpacing = (theme.gridSpacing || 'Regular') as GridSpacing

  const enableDownload = theme.enable_download ?? true
  const enableFavorites = theme.enable_favorites ?? true

  const colors = colorConfigs[palette as keyof typeof colorConfigs] || colorConfigs.Dark

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${typographyConfig[typography as keyof typeof typographyConfig]}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >

      {isPreview && (
        <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white text-[8px] font-black uppercase tracking-[0.5em] py-2 text-center z-[100]">
          Aperçu de la Galerie — Non Publiée
        </div>
      )}

      {/* HERO */}
      {coverStyle !== 'None' && (
        <section className="relative w-full h-screen overflow-hidden">
          
          <img
            src={gallery.cover_url || photos[0]?.url}
            alt="cover"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 h-full w-full px-6">

            {coverStyle === 'Center' && (
              <div className="flex items-center justify-center h-full text-center">
                <HeroContent gallery={gallery} />
              </div>
            )}

            {coverStyle === 'Left' && (
              <div className="flex items-center justify-start h-full text-left max-w-3xl">
                <HeroContent gallery={gallery} />
              </div>
            )}

            {coverStyle === 'Love' && (
              <div className="flex items-end justify-center h-full text-center pb-24">
                <HeroContent gallery={gallery} />
              </div>
            )}

            {coverStyle === 'Stripe' && (
              <div className="flex items-center justify-center h-full">
                <div className="bg-black/60 px-12 py-6 text-center backdrop-blur-md">
                  <HeroContent gallery={gallery} />
                </div>
              </div>
            )}

            {coverStyle === 'Outline' && (
              <div className="flex items-center justify-center h-full">
                <div className="border border-white/40 px-16 py-10 text-center">
                  <HeroContent gallery={gallery} />
                </div>
              </div>
            )}

            {coverStyle === 'Classic' && (
              <div className="flex items-center justify-center h-full text-center">
                <HeroContent gallery={gallery} />
              </div>
            )}

            {coverStyle === 'Frame' && (
              <div className="flex items-center justify-center h-full">
                <div className="bg-white p-4 shadow-2xl">
                  <div className="border border-black p-10 text-center text-black">
                    <HeroContent gallery={gallery} dark />
                  </div>
                </div>
              </div>
            )}

            {coverStyle === 'Divider' && (
              <div className="flex h-full">
                <div className="w-1/2 flex items-center justify-center bg-black/60">
                  <HeroContent gallery={gallery} />
                </div>
                <div className="w-1/2" />
              </div>
            )}

            {coverStyle === 'Stamp' && (
              <div className="flex items-center justify-center h-full">
                <div className="w-56 h-56 rounded-full border-2 border-white flex items-center justify-center text-center">
                  <HeroContent gallery={gallery} />
                </div>
              </div>
            )}

            {coverStyle === 'Journal' && (
              <div className="flex items-start justify-start h-full pt-32 pl-16 text-left max-w-2xl">
                <HeroContent gallery={gallery} />
              </div>
            )}

            {coverStyle === 'Novel' && (
              <div className="flex items-center justify-center h-full">
                <div className="max-w-xl text-center space-y-6">
                  <p className="uppercase tracking-[0.6em] text-white/60 text-[10px]">
                    {gallery.event_date || 'Collection'}
                  </p>
                  <h1 className="text-5xl font-serif italic text-white">
                    {gallery.event_name}
                  </h1>
                </div>
              </div>
            )}

            {coverStyle === 'Vintage' && (
              <div className="flex items-center justify-center h-full">
                <div className="bg-black/50 px-10 py-6 border border-white/20 text-center backdrop-blur-sm">
                  <HeroContent gallery={gallery} />
                </div>
              </div>
            )}

          </div>
        </section>
      )}

      {/* NAV */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-xl py-6 px-10 flex justify-between"
        style={{ backgroundColor: `${colors.bg}CC`, borderColor: colors.border }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src={gallery.profiles?.avatar_url} alt="avatar" />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase">{gallery.event_name}</h4>
            <p className="text-[8px] opacity-50">{gallery.profiles?.full_name}</p>
          </div>
        </div>

        <div className="flex gap-6">
          {enableFavorites && <Heart size={18} />}
          {enableDownload && <Download size={18} />}
          <Share2 size={18} />
        </div>
      </nav>

      {/* GRID */}
      <main className="max-w-[2200px] mx-auto py-24 px-4 md:px-20">
        <div className={`${gridSpacing === 'Regular' ? 'p-2' : 'p-10'}`}>
          <div className={`${gridConfig.columns[thumbnailSize]} ${gridConfig.gap[gridSpacing]}`}>
            {photos.map((photo, i) => (
              <div key={i} className="break-inside-avoid group overflow-hidden">
                <img
                  src={photo.url}
                  alt="photo"
                  className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-32 flex flex-col items-center gap-6 opacity-30 border-t" style={{ borderColor: colors.border }}>
        <div className="h-8 w-[1px] bg-current" />
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">
          MboaPix — Digital Experience
        </p>
      </footer>

    </div>
  )
}