'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  ImageIcon, 
  Settings, 
  LogOut, 
  Zap,
  Menu,
  X,
  Cloud
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

export default function Sidebar({ profile: initialProfile }: { profile?: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [fetchedProfile, setFetchedProfile] = useState<any>(null)
  const profile = initialProfile || fetchedProfile

  const [storageData, setStorageData] = useState<{
    usedBytes: number
    limitBytes: number
    storagePercent: number
    usedFormatted: string
    limitFormatted: string
    photosCount?: number
    cloudSource?: string
  } | null>(null)
  const [loadingStorage, setLoadingStorage] = useState(false)

  // Fonction pour interroger le stockage cloud réel des images du profil
  const fetchCloudStorage = useCallback(async (userId?: string) => {
    const targetId = userId || profile?.id
    if (!targetId) return

    try {
      setLoadingStorage(true)
      const res = await fetch(`/api/storage?userId=${encodeURIComponent(targetId)}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        setStorageData({
          usedBytes: data.usedBytes ?? 0,
          limitBytes: data.limitBytes ?? 2147483648,
          storagePercent: data.storagePercent ?? 0,
          usedFormatted: data.usedFormatted ?? '0 Mo',
          limitFormatted: data.limitFormatted ?? '2 Go',
          photosCount: data.photosCount,
          cloudSource: data.cloudSource,
        })
      }
    } catch (err) {
      console.warn('Erreur lecture stockage cloud:', err)
    } finally {
      setLoadingStorage(false)
    }
  }, [profile?.id])

  useEffect(() => {
    let isMounted = true
    async function init() {
      let uid = profile?.id
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          uid = user.id
          if (!profile && isMounted) {
            const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
            if (data && isMounted) setFetchedProfile(data)
          }
        }
      }
      if (uid && isMounted) {
        fetchCloudStorage(uid)
      }
    }
    init()

    const handleStorageChange = () => {
      fetchCloudStorage()
    }
    window.addEventListener('cloud-storage-change', handleStorageChange)
    return () => {
      isMounted = false
      window.removeEventListener('cloud-storage-change', handleStorageChange)
    }
  }, [fetchCloudStorage, profile])

  // Valeurs calculées : priorité aux données cloud lues en direct
  const usedBytes = storageData ? storageData.usedBytes : (Number(profile?.storage_used) || 0)
  const limitBytes = storageData ? storageData.limitBytes : (Number(profile?.storage_limit) || 2147483648)
  const storagePercent = storageData
    ? storageData.storagePercent
    : (limitBytes > 0 ? Math.min(Math.round((usedBytes / limitBytes) * 100), 100) : 0)

  const formatHumanBytes = (bytes: number) => {
    if (bytes <= 0) return '0 Mo'
    const gb = bytes / (1024 ** 3)
    const mb = bytes / (1024 ** 2)
    if (gb >= 1) return `${gb.toFixed(2)} Go`
    return `${mb.toFixed(1)} Mo`
  }

  const formattedUsed = storageData?.usedFormatted || formatHumanBytes(usedBytes)
  const formattedLimit = storageData?.limitFormatted || formatHumanBytes(limitBytes)
  const percentDisplay = usedBytes > 0 && storagePercent === 0 ? '<1%' : `${storagePercent}%`

  const menuItems = [
    { icon: <LayoutDashboard size={18}/>, label: "Mon Studio", href: "/dashboard" },
    { icon: <ImageIcon size={18}/>, label: "Collections", href: "/dashboard/galleries" },
    { icon: <Settings size={18}/>, label: "Réglages", href: "/dashboard/settings" },
  ]

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12 px-2 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
          <Zap size={20} fill="currentColor" />
        </div>
        <span className="text-xl font-black tracking-tighter uppercase italic dark:text-white">
          Mboa<span className="text-orange-600">Pix</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {menuItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              pathname === item.href 
                ? 'bg-orange-500/10 text-orange-600 shadow-sm' 
                : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </nav>

      {/* État du stockage Cloud */}
      <div className="my-6 px-4 py-4 rounded-2xl bg-gray-50/75 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] shrink-0">
        <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-1.5">
            <Cloud size={13} className="text-orange-600" />
            <p className="text-[9px] font-black uppercase tracking-[1.5px] text-gray-500 dark:text-gray-400">
              Stockage Cloud
            </p>
          </div>
          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
            {loadingStorage && !storageData ? '...' : percentDisplay}
          </span>
        </div>

        <div className="h-2 w-full bg-gray-200/80 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(usedBytes > 0 ? 2 : 0, storagePercent)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.35)]"
          />
        </div>

        <div className="flex justify-between items-center mt-2.5 text-[8px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span>{formattedUsed}</span>
          <span className="text-gray-400">sur {formattedLimit}</span>
        </div>
      </div>

      {/* Logout */}
      <div className="pt-6 border-t border-gray-100 dark:border-white/[0.05] shrink-0">
        <button 
          onClick={() => supabase.auth.signOut().then(() => router.push('/connexion'))}
          className="flex items-center gap-3 text-gray-400 hover:text-red-500 transition-all text-xs font-bold uppercase tracking-widest px-4 py-2 w-full text-left"
        >
          <LogOut size={18} /> Quitter
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* MOBILE TRIGGER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/[0.05] z-[60] px-6 flex items-center justify-between">
        <span className="font-black italic text-lg uppercase dark:text-white">Mboa<span className="text-orange-600">Pix</span></span>
        <button onClick={() => setIsOpen(true)} className="p-2 dark:text-white" aria-label="Ouvrir le menu"><Menu size={24}/></button>
      </div>

      {/* DESKTOP SIDEBAR - STATIQUE ET FIXE */}
      <aside className="w-72 border-r border-gray-100 dark:border-white/[0.05] hidden lg:flex flex-col p-8 h-screen sticky top-0 self-start bg-white dark:bg-[#050505] shrink-0 z-30 select-none overflow-hidden">
        {renderSidebarContent()}
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-[#0d0d0d] z-[80] p-8 lg:hidden shadow-2xl overflow-y-auto"
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-gray-400" aria-label="Fermer le menu"><X size={24}/></button>
              {renderSidebarContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
