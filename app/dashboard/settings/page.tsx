'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Image as ImageIcon, Palette, Upload } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

type Profile = {
  id?: string
  full_name?: string
  email?: string
  subscription_tier?: string
  avatar_url?: string
  favicon_url?: string | null
  description?: string | null
  storage_used?: number | string
  storage_limit?: number | string
  public_slug?: string | null
}

const toPublicSlug = (value?: string | null) => {
  if (!value) return 'photographe'

  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'photographe'
}

export default function DashboardSettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [defaultDomain, setDefaultDomain] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [publicSlugValue, setPublicSlugValue] = useState('')
  const [photographerDescription, setPhotographerDescription] = useState('')

  const handleSaveProfile = async () => {
    if (!profile?.id) return

    const slug = toPublicSlug(publicSlugValue || profile.full_name)
    const trimmedDescription = photographerDescription.trim()
    const profileUpdate: Record<string, string | null> = {
      public_slug: slug,
      avatar_url: logoUrl || profile.avatar_url || '',
      favicon_url: faviconUrl || profile.favicon_url || null,
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', profile.id)

      if (error) throw error

      try {
        await supabase
          .from('profiles')
          .update({ description: trimmedDescription })
          .eq('id', profile.id)
      } catch {
        // La colonne description n’existe pas encore dans la table ; on ignore sans bloquer l’upload.
      }

      setProfile((prev) => prev ? { ...prev, public_slug: slug, avatar_url: logoUrl || prev.avatar_url, favicon_url: faviconUrl || prev.favicon_url, description: trimmedDescription } : prev)
      setDefaultDomain(`${typeof window !== 'undefined' ? window.location.origin : ''}/${slug}`)
      alert('Profil enregistré avec succès.')
    } catch (error) {
      console.error('Erreur enregistrement profil:', error)
      alert('Impossible d’enregistrer le profil.')
    }
  }

  const handleAssetUpload = async (event: React.ChangeEvent<HTMLInputElement>, kind: 'logo' | 'favicon') => {
    const file = event.target?.files?.[0]
    if (!file || !profile?.id) return

    const safeFileName = file.name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.\-_]+/g, '-')

    const storageKey = `${profile.id}/${kind}/${Date.now()}-${safeFileName}`
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', storageKey)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erreur upload')
      }

      const result = await response.json()
      const url = result.url

      if (!url) {
        throw new Error('Aucune URL renvoyée')
      }

      if (kind === 'logo') {
        setLogoUrl(url)
        try {
          await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
        } catch (error) {
          console.warn('Impossible d’enregistrer le logo dans profiles.avatar_url:', error)
        }
      } else {
        setFaviconUrl(url)
        try {
          await supabase.from('profiles').update({ favicon_url: url }).eq('id', profile.id)
        } catch (error) {
          console.warn('Impossible d’enregistrer le favicon dans profiles:', error)
        }
      }
    } catch (error) {
      console.error(`Erreur upload ${kind}:`, error)
      alert(`L’upload du ${kind === 'logo' ? 'logo' : 'favicon'} a échoué.`)
    }
  }

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/connexion')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLogoUrl(data?.avatar_url || '')
      setFaviconUrl(data?.favicon_url || '')
      setPublicSlugValue(data?.public_slug || toPublicSlug(data?.full_name))
      setPhotographerDescription(data?.description || '')

      const baseOrigin = typeof window !== 'undefined' ? window.location.origin : ''
      const publicSlug = data?.public_slug || toPublicSlug(data?.full_name)
      setDefaultDomain(`${baseOrigin}/${publicSlug}`)
      setLoading(false)
    }

    void loadProfile()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#fafafa] dark:bg-[#050505] flex transition-colors duration-300 overflow-hidden">
      <Sidebar profile={profile} />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-16">
        <div className="max-w-6xl mx-auto pb-16">
          <header className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mb-3">
              Réglages du studio
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter uppercase dark:text-white">
              Mon identité
            </h1>
          </header>

          <div className="space-y-8">
            <section className="bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-white/[0.05] rounded-[2rem] p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <Globe size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter dark:text-white">
                    Adresse publique
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Lien de votre galerie
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-gray-100 dark:border-white/[0.05] bg-[#fafafa] dark:bg-white/[0.02] p-4 md:p-5">
                <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-3">
                  URL publique
                </label>
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#080808] px-4 py-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 break-all">{defaultDomain}</span>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-600 shrink-0">
                    actif
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  Votre page publique s’appuie sur l’URL du navigateur et sur le slug enregistré dans votre profil.
                  Exemple : <span className="font-semibold text-orange-600">{typeof window !== 'undefined' ? `${window.location.origin}/jean-dupont` : 'https://votre-app.com/jean-dupont'}</span>
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-white/[0.05] rounded-[2rem] p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <Globe size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter dark:text-white">
                    Profil public
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Slug et bio du photographe
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-3">Slug public</label>
                  <input
                    value={publicSlugValue}
                    onChange={(event) => setPublicSlugValue(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#080808] px-4 py-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-orange-600"
                    placeholder="jean-dupont"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-3">Description du photographe</label>
                  <textarea
                    value={photographerDescription}
                    onChange={(event) => setPhotographerDescription(event.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#080808] px-4 py-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-orange-600 resize-none"
                    placeholder="Photographe de mariage et de portraits, inspiré par la lumière naturelle et les émotions authentiques."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="bg-orange-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform"
                >
                  Enregistrer le profil
                </button>
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-2">
              <div className="bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-white/[0.05] rounded-[2rem] p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter dark:text-white">
                      Logo
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Logo principal
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-dashed border-gray-200 dark:border-white/10 bg-[#fafafa] dark:bg-white/[0.02] p-5">
                  <div className="min-h-[120px] rounded-[1.25rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#080808] flex items-center justify-center mb-4">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo du studio" className="max-h-16 object-contain" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] mb-1">Logo</div>
                        <div className="text-xs opacity-60">Aucun fichier</div>
                      </div>
                    )}
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                    <Upload size={14} />
                    Télécharger
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => handleAssetUpload(event, 'logo')} />
                  </label>

                  <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    Votre logo sera utilisé à la place du logo texte et de l&apos;icône de profil, y compris sur le fond blanc de la page d&apos;accueil.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-white/[0.05] rounded-[2rem] p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <Palette size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter dark:text-white">
                      Favicon
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Icône de navigateur
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-dashed border-gray-200 dark:border-white/10 bg-[#fafafa] dark:bg-white/[0.02] p-5">
                  <div className="w-20 h-20 rounded-2xl mx-auto bg-white dark:bg-[#080808] border border-gray-200 dark:border-white/10 flex items-center justify-center mb-4">
                    {faviconUrl ? (
                      <img src={faviconUrl} alt="Favicon du studio" className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center text-[10px] font-black">
                        M
                      </div>
                    )}
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                    <Upload size={14} />
                    Uploader
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => handleAssetUpload(event, 'favicon')} />
                  </label>

                  <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    Vous pouvez télécharger un fichier GIF, PNG ou ICO jusqu&apos;à 32x32 pixels.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  )
}
