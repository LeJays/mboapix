'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Search, 
  ChevronDown, 
  MoreHorizontal, 
  Grid, 
  List,
  Image as ImageIcon,
  Plus,
  Lock,
  ArrowUpDown,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import CreateGalleryModal from '@/components/CreateGalleryModal'

export default function CollectionsPage() {
  const [galleries, setGalleries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // États de contrôle
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [sortByDate, setSortByDate] = useState<'desc' | 'asc'>('desc')

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(profileData)

    const { data } = await supabase
      .from('galleries')
      .select('*')
      .eq('photographer_id', user.id)
    
    setGalleries(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- LOGIQUE DE FILTRAGE & TRI ---
  const processedGalleries = useMemo(() => {
    let result = [...galleries]

    if (searchTerm) {
      result = result.filter(g => g.event_name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (statusFilter !== 'all') {
      const target = statusFilter === 'published'
      result = result.filter(g => g.is_published === target)
    }

    result.sort((a, b) => {
      const dateA = new Date(a.event_date || a.created_at).getTime()
      const dateB = new Date(b.event_date || b.created_at).getTime()
      return sortByDate === 'desc' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [galleries, searchTerm, statusFilter, sortByDate])

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex transition-colors duration-300">
      <Sidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="border-b border-gray-100 dark:border-white/5 px-6 md:px-12 py-5 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-md z-30">
          <div className="flex items-center gap-6 flex-1">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter italic uppercase dark:text-white shrink-0">
              Collections
            </h1>
            <div className="relative flex-1 max-w-md hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..." 
                className="w-full bg-gray-100/50 dark:bg-white/5 border-none rounded-2xl text-[13px] outline-none pl-12 pr-4 py-3 text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-black dark:bg-white text-white dark:text-black px-4 py-3 md:px-6 md:py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-[1.02] transition-all">
            <Plus size={18} strokeWidth={3} className="text-orange-600" />
            <span className="hidden md:inline">Nouveau</span>
          </button>
        </header>

        {/* TOOLBAR */}
        <div className="px-6 md:px-12 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/30 dark:bg-black/10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* FILTRE DE STATUT (NOUVEAU) */}
            <select 
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="appearance-none px-4 py-2 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0d0d0d] text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest outline-none cursor-pointer hover:border-orange-500/30 transition-colors"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">✨ Publiées</option>
              <option value="draft">📝 Brouillons</option>
            </select>

            <button 
              onClick={() => setSortByDate(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0d0d0d] text-[10px] font-black text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-widest"
            >
              <ArrowUpDown size={14} className="text-orange-600" />
              {sortByDate === 'desc' ? 'Plus récents' : 'Plus anciens'}
            </button>
          </div>
          
          <div className="flex items-center gap-2 border-l border-gray-200 dark:border-white/10 pl-4 hidden xs:flex">
             <button className="p-2 text-orange-600 bg-orange-500/10 rounded-lg"><Grid size={18} /></button>
             <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"><List size={18} /></button>
          </div>
        </div>

        {/* MAIN GRID */}
        <main className="p-6 md:p-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}
            </div>
          ) : processedGalleries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6">
                <Search size={32} className="text-orange-600" />
              </div>
              <h3 className="font-black italic text-xl uppercase dark:text-white">Aucun projet</h3>
              <p className="text-sm text-gray-500 mt-2 uppercase tracking-widest italic">Ajustez vos filtres pour voir vos clichés.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-12">
              {processedGalleries.map((gallery) => (
                <CollectionCard key={gallery.id} gallery={gallery} />
              ))}
            </div>
          )}
        </main>
      </div>

      <CreateGalleryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={fetchData} />
    </div>
  )
}

function CollectionCard({ gallery }: { gallery: any }) {
  return (
    <Link href={`/dashboard/galleries/${gallery.slug}`} className="group block">
      <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-[#0d0d0d] mb-5 relative transition-all border border-transparent group-hover:border-orange-500/30 group-hover:shadow-[0_20px_50px_rgba(234,88,12,0.15)]">
        {gallery.cover_url ? (
          <img src={gallery.cover_url} alt={gallery.event_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-800 gap-2">
            <ImageIcon size={40} strokeWidth={1} />
            <span className="text-[9px] font-black uppercase tracking-[3px]">MboaPix</span>
          </div>
        )}
        
        {/* BADGES SUPERPOSÉS */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
            {/* Statut de publication */}
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm ${gallery.is_published ? 'bg-black/60 text-white' : 'bg-white/90 text-black border border-gray-100'}`}>
                {gallery.is_published ? <Eye size={10} className="text-orange-500" /> : <EyeOff size={10} />}
                {gallery.is_published ? 'En ligne' : 'Brouillon'}
            </span>
            
            {/* Statut de protection (si activé) */}
            {gallery.is_protected && (
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white shadow-lg backdrop-blur-md">
                    <Lock size={12} strokeWidth={3} />
                </span>
            )}
        </div>
      </div>

      <div className="px-2">
        <h3 className="text-base font-black tracking-tight text-gray-900 dark:text-white truncate mb-1 uppercase italic group-hover:text-orange-600 transition-colors duration-300">
          {gallery.event_name}
        </h3>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[2px]">
          {gallery.location || 'Lieu non défini'} • {new Date(gallery.event_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
        </p>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] bg-gray-100 dark:bg-white/5 rounded-[2.5rem] animate-pulse"></div>
      <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-2/3 ml-2"></div>
    </div>
  )
}