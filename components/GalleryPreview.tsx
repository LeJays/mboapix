'use client'

import React from 'react'
import { Download, Heart, Share2, Check } from 'lucide-react'

export type ColorPalette = 'Light' | 'Gold' | 'Rose' | 'Terracotta' | 'Sand' | 'Olive' | 'Agave' | 'Sea' | 'Dark'
export type TypographyStyle = 'Sans' | 'Serif' | 'Modern' | 'Timeless' | 'Bold' | 'Subtle'
export type ThumbnailSize = 'Regular' | 'Large'
export type GridSpacing = 'Regular' | 'Large'
export type NavigationStyle = 'Icon Only' | 'Icon & Text'
export type CoverStyle = 'Center' | 'Love' | 'Left' | 'Novel' | 'Vintage' | 'Frame' | 'Stripe' | 'Divider' | 'Journal' | 'Stamp' | 'Outline' | 'Classic' | 'None'

export const typographyConfig: Record<TypographyStyle, string> = {
  Sans: 'font-sans tracking-normal',
  Serif: 'font-serif tracking-normal',
  Modern: 'font-sans tracking-[0.2em] font-light uppercase',
  Timeless: 'font-serif italic tracking-wide font-light',
  Bold: 'font-sans font-black uppercase tracking-tighter',
  Subtle: 'font-sans font-thin tracking-[0.3em] uppercase opacity-70',
}

export const colorConfigs: Record<ColorPalette, { bg: string; accent: string; text: string; border: string }> = {
  Light: { bg: '#FFFFFF', accent: '#EA580C', text: '#111827', border: '#F3F4F6' },
  Gold: { bg: '#FAF9F6', accent: '#A68966', text: '#433422', border: '#EFEBE5' },
  Rose: { bg: '#FFF9F9', accent: '#A67B7B', text: '#4A3535', border: '#F5E8E8' },
  Terracotta: { bg: '#FDF8F5', accent: '#A66D4F', text: '#4A2E1F', border: '#F2E3DB' },
  Sand: { bg: '#F9F7F5', accent: '#8C7A6B', text: '#3D352F', border: '#EEEAE6' },
  Olive: { bg: '#F9FAF7', accent: '#8C9475', text: '#383D2E', border: '#EDF0E6' },
  Agave: { bg: '#F7F9F8', accent: '#789489', text: '#2E3D38', border: '#E6EFEA' },
  Sea: { bg: '#F6F7F9', accent: '#7D8494', text: '#2E323D', border: '#E6E9EF' },
  Dark: { bg: '#080808', accent: '#EA580C', text: '#FFFFFF', border: '#1F2937' },
}

export const gridConfig = {
  columns: {
    Regular: 'columns-2 sm:columns-3 lg:columns-4',
    Large: 'columns-1 sm:columns-2 lg:columns-2',
  },
  gap: {
    Regular: 'gap-1 space-y-1',
    Large: 'gap-8 space-y-8',
  },
}

export interface GalleryThemeProps {
  palette?: ColorPalette | string
  typography?: TypographyStyle | string
  coverStyle?: CoverStyle | string
  thumbnailSize?: ThumbnailSize | string
  gridSpacing?: GridSpacing | string
  navStyle?: NavigationStyle | string
  show_logo?: boolean
  show_description?: boolean
  title_position?: 'center' | 'left'
  logo_position?: 'top-left' | 'top-center' | 'bottom-left'
  description_position?: 'bottom' | 'side'
  cover_description?: string
  [key: string]: unknown
}

export interface GalleryPreviewProps {
  gallery: {
    id?: string
    event_name?: string
    cover_url?: string | null
    profiles?: {
      avatar_url?: string | null
      full_name?: string | null
      description?: string | null
    } | null
    [key: string]: unknown
  }
  photos: Array<{
    id?: string
    url: string
    display_url?: string
    name?: string
    [key: string]: unknown
  }>
  theme?: GalleryThemeProps
  showBrowserFrame?: boolean
  isFavorited?: boolean
  selectedPhotos?: string[]
  onPhotoClick?: (index: number) => void
  onPhotoSelect?: (photo: any) => void
  onFavorite?: () => void
  onDownload?: () => void
  onShare?: () => void
}

export default function GalleryPreview({
  gallery,
  photos = [],
  theme = {},
  showBrowserFrame = false,
  isFavorited = false,
  selectedPhotos = [],
  onPhotoClick,
  onPhotoSelect,
  onFavorite,
  onDownload,
  onShare,
}: GalleryPreviewProps) {
  const palette = ((theme?.palette as ColorPalette) || 'Light') in colorConfigs
    ? (theme?.palette as ColorPalette)
    : 'Light'
  const typography = ((theme?.typography as TypographyStyle) || 'Sans') in typographyConfig
    ? (theme?.typography as TypographyStyle)
    : 'Sans'
  const coverStyle = ((theme?.coverStyle as CoverStyle) || 'Center')
  const thumbnailSize = (theme?.thumbnailSize as ThumbnailSize) === 'Large' ? 'Large' : 'Regular'
  const gridSpacing = (theme?.gridSpacing as GridSpacing) === 'Large' ? 'Large' : 'Regular'
  const navStyle = (theme?.navStyle as NavigationStyle) === 'Icon & Text' ? 'Icon & Text' : 'Icon Only'

  const showCoverLogo = theme?.show_logo !== false
  const showCoverDescription = theme?.show_description !== false
  const coverTitlePosition = theme?.title_position === 'left' ? 'left' : 'center'
  const coverLogoPosition = theme?.logo_position || 'top-left'
  const coverDescriptionPosition = theme?.description_position === 'side' ? 'side' : 'bottom'
  const coverDescriptionText = typeof theme?.cover_description === 'string'
    ? theme.cover_description
    : (gallery?.profiles?.description || '')

  const colors = colorConfigs[palette] || colorConfigs.Light
  const typoClass = typographyConfig[typography] || typographyConfig.Sans

  const content = (
    <>
      {/* --- COVER --- */}
      {coverStyle !== 'None' && (
        <div
          className={`relative w-full transition-all duration-700 ease-in-out
            ${['Center', 'Left', 'Stripe', 'Outline', 'Classic', 'Love'].includes(coverStyle) ? 'h-[80vh]' : ''}
            ${coverStyle === 'Novel' ? 'h-[70vh] flex flex-row-reverse' : ''}
            ${coverStyle === 'Vintage' ? 'h-[85vh] flex flex-col' : ''}
            ${coverStyle === 'Frame' ? 'h-[80vh] p-10' : ''}
            ${coverStyle === 'Divider' ? 'h-[80vh] flex' : ''}
            ${coverStyle === 'Journal' ? 'h-[80vh] flex p-12 gap-12' : ''}
            ${coverStyle === 'Stamp' ? 'h-[70vh] flex flex-col items-center justify-center' : ''}
          `}
        >
          <div
            className={`relative overflow-hidden transition-all duration-700
              ${['Center', 'Left', 'Stripe', 'Outline', 'Classic', 'Love', 'Stamp'].includes(coverStyle) ? 'w-full h-full' : ''}
              ${coverStyle === 'Novel' ? 'w-1/2 h-full' : ''}
              ${coverStyle === 'Vintage' ? 'w-full h-3/4' : ''}
              ${coverStyle === 'Frame' ? 'w-full h-full shadow-2xl' : ''}
              ${coverStyle === 'Divider' ? 'w-1/2 h-full' : ''}
              ${coverStyle === 'Journal' ? 'w-2/3 h-full' : ''}
            `}
          >
            {gallery?.cover_url && (
              <img src={gallery.cover_url} className="w-full h-full object-cover" alt="" />
            )}

            {showCoverLogo && gallery?.profiles?.avatar_url && (
              <div
                className={`absolute z-20 ${
                  coverLogoPosition === 'top-center'
                    ? 'top-8 left-1/2 -translate-x-1/2'
                    : coverLogoPosition === 'bottom-left'
                    ? 'bottom-8 left-8'
                    : 'top-8 left-8'
                }`}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-full border border-white/30 bg-white/10 backdrop-blur-md shadow-lg">
                  <img src={gallery.profiles.avatar_url} alt="Logo du studio" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div
              className={`absolute inset-0 flex items-center p-12
                ${
                  coverStyle === 'Center'
                    ? `${coverTitlePosition === 'left' ? 'justify-start text-left' : 'justify-center text-center'} bg-black/20`
                    : ''
                }
                ${coverStyle === 'Left' ? 'justify-start text-left bg-black/10' : ''}
                ${
                  coverStyle === 'Stripe'
                    ? `${coverTitlePosition === 'left' ? 'justify-start text-left' : 'justify-center text-center'} border-y-4 border-white/30 m-20 bg-black/20`
                    : ''
                }
                ${
                  coverStyle === 'Outline'
                    ? `${coverTitlePosition === 'left' ? 'justify-start text-left' : 'justify-center text-center'} bg-black/10`
                    : ''
                }
                ${coverStyle === 'Love' ? 'justify-center text-center bg-white/10 backdrop-blur-[2px]' : ''}
              `}
            >
              {['Center', 'Left', 'Stripe', 'Outline', 'Classic', 'Frame'].includes(coverStyle) && (
                <div className={coverStyle === 'Outline' ? 'border-2 border-white p-10' : ''}>
                  <div className={coverDescriptionPosition === 'side' ? 'flex items-end gap-6' : ''}>
                    <h4
                      className={`text-white uppercase drop-shadow-2xl ${typoClass} ${
                        coverStyle === 'Outline' ? 'text-5xl' : 'text-6xl'
                      } ${coverTitlePosition === 'left' ? 'text-left' : 'text-center'}`}
                    >
                      {gallery?.event_name}
                    </h4>
                    {coverDescriptionPosition === 'side' && showCoverDescription && coverDescriptionText.trim() && (
                      <p className="max-w-[220px] text-sm text-white/75 leading-relaxed">
                        {coverDescriptionText.trim()}
                      </p>
                    )}
                  </div>
                  {coverDescriptionPosition !== 'side' && showCoverDescription && coverDescriptionText.trim() && (
                    <p className="mt-5 text-sm text-white/75 leading-relaxed">
                      {coverDescriptionText.trim()}
                    </p>
                  )}
                </div>
              )}

              {coverStyle === 'Love' && (
                <div className="flex flex-col items-center gap-4">
                  <h4 className={`text-white uppercase text-[12vw] leading-none opacity-90 drop-shadow-2xl ${typoClass}`}>
                    LOVE
                  </h4>
                  {showCoverDescription && coverDescriptionText.trim() && (
                    <p className="max-w-xl text-sm text-white/75 leading-relaxed">
                      {coverDescriptionText.trim()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {['Novel', 'Vintage', 'Divider', 'Journal', 'Stamp'].includes(coverStyle) && (
            <div
              className="flex flex-col items-center justify-center p-10 transition-colors"
              style={{
                width: coverStyle === 'Novel' || coverStyle === 'Divider' ? '50%' : '100%',
                height: coverStyle === 'Vintage' ? '25%' : '100%',
              }}
            >
              {coverStyle === 'Stamp' && (
                <div className="w-16 h-16 overflow-hidden mb-4 border-2 p-1" style={{ borderColor: colors.accent }}>
                  <img src={gallery?.cover_url || ''} className="w-full h-full object-cover" alt="" />
                </div>
              )}
              <h4 className={`uppercase ${typoClass} ${coverStyle === 'Journal' ? 'text-4xl' : 'text-5xl'}`}>
                {gallery?.event_name}
              </h4>
              <div className="w-12 h-1 mt-4" style={{ backgroundColor: colors.accent }} />
              <p className={`text-[10px] opacity-60 uppercase mt-2 ${typoClass}`}>
                {gallery?.profiles?.full_name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- NAV STICKY --- */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 border-b backdrop-blur-md transition-all duration-500"
        style={{
          backgroundColor: `${colors.bg}E6`,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border"
            style={{ borderColor: colors.border, backgroundColor: colors.border }}
          >
            {gallery?.profiles?.avatar_url ? (
              <img src={gallery.profiles.avatar_url} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <span className="text-[10px] font-black opacity-40">
                {gallery?.profiles?.full_name?.charAt(0) || 'P'}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className={`text-[10px] uppercase ${typoClass}`}>{gallery?.event_name}</h3>
            <span className={`text-[7px] opacity-60 uppercase ${typoClass}`}>
              {gallery?.profiles?.full_name || 'STUDIO'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={onFavorite}
            type="button"
            className="flex items-center gap-2 transition-colors hover:opacity-70"
            style={{ color: colors.accent }}
          >
            <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
            {navStyle === 'Icon & Text' && (
              <span className="text-[9px] font-bold uppercase tracking-wider">Favoris</span>
            )}
          </button>
          <button
            onClick={onDownload}
            type="button"
            className="flex items-center gap-2 transition-colors hover:opacity-70"
            style={{ color: colors.accent }}
          >
            <Download size={16} />
            {navStyle === 'Icon & Text' && (
              <span className="text-[9px] font-bold uppercase tracking-wider">Download</span>
            )}
          </button>
          <button
            onClick={onShare}
            type="button"
            className="flex items-center gap-2 transition-colors hover:opacity-70"
            style={{ color: colors.accent }}
          >
            <Share2 size={16} />
            {navStyle === 'Icon & Text' && (
              <span className="text-[9px] font-bold uppercase tracking-wider">Share</span>
            )}
          </button>
        </div>
      </div>

      {/* --- PHOTO GRID --- */}
      <div className={`transition-all duration-500 ${gridSpacing === 'Regular' ? 'p-1 md:p-2' : 'p-8 md:p-16'}`}>
        <div className={`transition-all duration-500 ${gridConfig.columns[thumbnailSize]} ${gridConfig.gap[gridSpacing]}`}>
          {photos.map((p, i) => (
            <div
              key={p.id || i}
              onClick={() => onPhotoClick?.(i)}
              className={`break-inside-avoid overflow-hidden group mb-1 relative ${
                onPhotoClick ? 'cursor-pointer' : ''
              }`}
            >
              <img
                src={p.display_url || p.url}
                className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-all duration-700 hover:scale-105"
                alt={p.name || ''}
              />
              {onPhotoSelect && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPhotoSelect(p)
                  }}
                  className={`absolute top-3 right-3 z-10 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    selectedPhotos?.includes(p.id || p.url) ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: selectedPhotos?.includes(p.id || p.url) ? colors.accent : 'rgba(255,255,255,0.9)',
                    color: selectedPhotos?.includes(p.id || p.url) ? '#fff' : colors.text,
                  }}
                  aria-label="Sélectionner"
                >
                  {selectedPhotos?.includes(p.id || p.url) ? <Check size={14} /> : <Heart size={14} />}
                </button>
              )}
            </div>
          ))}
        </div>
        {photos.length === 0 && (
          <div className="py-24 text-center text-sm opacity-40 font-mono uppercase tracking-widest">
            Aucune photo disponible
          </div>
        )}
      </div>
    </>
  )

  if (showBrowserFrame) {
    return (
      <div
        className="w-full max-w-7xl min-h-[90vh] shadow-2xl overflow-hidden flex flex-col border transition-all duration-700 mb-20 rounded-3xl"
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          borderColor: colors.border,
        }}
      >
        <div
          className="h-8 border-b flex items-center px-4 gap-1.5 shrink-0"
          style={{ borderColor: colors.border }}
        >
          <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: colors.text }} />
          <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: colors.text }} />
          <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: colors.text }} />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">{content}</div>
      </div>
    )
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col transition-all duration-700"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {content}
    </div>
  )
}
