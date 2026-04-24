'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import Sidebar from '@/components/Sidebar'
import CreateGalleryModal from '@/components/CreateGalleryModal'

export default function Dashboard() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({ galleries: 0, totalViews: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAllData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { count: galCount } = await supabase.from('galleries').select('*', { count: 'exact', head: true }).eq('photographer_id', user.id)
      const { data: activityData } = await supabase.rpc('get_studio_activity', { user_id_param: user.id })

      setProfile(profileData)
      setStats({ 
        galleries: galCount || 0, 
        totalViews: activityData?.reduce((acc: number, curr: any) => acc + Number(curr.vues), 0) || 0 
      })
      setChartData(activityData || [])
      setLoading(false)
    }
    loadAllData()
  }, [router])

  const used = Number(profile?.storage_used) || 0
  const limit = Number(profile?.storage_limit) || 2147483648 
  const storagePercent = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0
  const storageUsedGB = (used / (1024 ** 3)).toFixed(2)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
      <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] flex transition-colors duration-300">
      
      {/* UTILISATION DE LA SIDEBAR EXTERNE */}
      <Sidebar profile={profile} />

      <main className="flex-1 lg:max-w-7xl mx-auto p-6 pt-24 md:p-12 lg:p-16 lg:pt-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 text-left">
          <div>
            <span className="px-3 py-1 bg-orange-500/10 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block">
              {profile?.subscription_tier || 'Mboa Free'}
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic leading-[0.8] dark:text-white">Mon Studio.</h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-tighter flex items-center justify-center gap-4 hover:scale-[1.05] transition-all shadow-xl"
          >
            <Plus size={18} strokeWidth={3} /> Nouvelle galerie
          </button>
        </header>

        {/* CARDS DE STATS RESTE ICI CAR ELLES SONT PROPRES AU DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          <StatMini label="Stockage" value={`${storagePercent}%`} sub={`${storageUsedGB} Go utilisés`} />
          <StatMini label="Audience" value={stats.totalViews.toLocaleString()} sub="Vues cumulées" />
          <StatMini label="Galeries" value={stats.galleries.toString()} sub="Projets actifs" color="text-orange-600" />
        </div>

        {/* GRAPHIQUE D'ACTIVITÉ */}
        <div className="bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-white/[0.05] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm overflow-hidden">
          <div className="mb-10 text-left">
            <h2 className="text-xl font-black tracking-tight italic dark:text-white">Activité</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest italic">Visites (7 derniers jours)</p>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/><stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#888'}} dy={10} />
                <Tooltip contentStyle={{borderRadius: '15px', border: 'none', backgroundColor: '#000', color: '#fff', fontSize: '10px'}} />
                <Area type="monotone" dataKey="vues" stroke="#ea580c" strokeWidth={3} fill="url(#colorVues)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>

      <CreateGalleryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={() => window.location.reload()} />
    </div>
  )
}

function StatMini({ label, value, sub, color = "" }: any) {
  return (
    <div className="bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-white/[0.05] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm text-left">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">{label}</p>
      <h3 className={`text-3xl md:text-4xl font-black tracking-tighter italic leading-none ${color || 'text-black dark:text-white'}`}>{value}</h3>
      <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase tracking-wider italic">{sub}</p>
    </div>
  )
}