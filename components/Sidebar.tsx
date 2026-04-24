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
  X 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Sidebar({ profile }: { profile: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const used = Number(profile?.storage_used) || 0
  const limit = Number(profile?.storage_limit) || 2147483648 
  const storagePercent = Math.min(Math.round((used / limit) * 100), 100)
  const storageUsedGB = (used / (1024 ** 3)).toFixed(2)

  const menuItems = [
    { icon: <LayoutDashboard size={18}/>, label: "Mon Studio", href: "/dashboard" },
    { icon: <ImageIcon size={18}/>, label: "Collections", href: "/dashboard/galleries" },
    { icon: <Settings size={18}/>, label: "Réglages", href: "/dashboard/settings" },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-16 px-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <Zap size={20} fill="currentColor" />
        </div>
        <span className="text-xl font-black tracking-tighter uppercase italic dark:text-white">
          Mboa<span className="text-orange-600">Pix</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
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

      {/* Stockage */}
      <div className="mb-8 px-4">
        <div className="flex justify-between items-end mb-2">
          <p className="text-[9px] font-black uppercase tracking-[2px] text-gray-400">Espace</p>
          <p className="text-[10px] font-bold dark:text-white">{storagePercent}%</p>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${storagePercent}%` }}
            className={`h-full rounded-full bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.3)]`}
          />
        </div>
        <p className="text-[8px] font-medium text-gray-500 mt-2 uppercase tracking-widest">
          {storageUsedGB} Go utilisés
        </p>
      </div>

      {/* Logout */}
      <div className="pt-8 border-t border-gray-100 dark:border-white/[0.05]">
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
        <button onClick={() => setIsOpen(true)} className="p-2 dark:text-white"><Menu size={24}/></button>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 border-r border-gray-100 dark:border-white/[0.05] hidden lg:flex flex-col p-8 sticky top-0 h-screen bg-white dark:bg-[#050505]">
        <SidebarContent />
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
              className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-[#0d0d0d] z-[80] p-8 lg:hidden shadow-2xl"
            >
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-gray-400"><X size={24}/></button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}