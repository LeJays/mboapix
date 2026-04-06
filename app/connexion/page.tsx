'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function Connexion() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-white flex items-center justify-center p-6 font-sans text-xs">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex items-center gap-2 justify-center mb-12 group">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-base">M</div>
          <span className="text-2xl font-black tracking-tighter">Mboa<span className="text-orange-600">Pix</span></span>
        </Link>

        <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-100 dark:border-gray-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl">
          <h1 className="text-2xl font-black tracking-tighter mb-2">Bon retour !</h1>
          <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">Accédez à votre studio photo</p>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 font-bold"
            >
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="email"
                  placeholder="votre@email.com"
                  className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-600 transition-all"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mot de passe</label>
                {/* LIEN AJOUTÉ ICI */}
                <Link 
                  href="/mot-de-passe-oublie" 
                  className="text-[9px] font-bold text-orange-600 uppercase tracking-tighter hover:underline"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-600 transition-all"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[2px] shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"} <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center mt-8 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Pas encore de compte ? <Link href="/inscription" className="text-orange-600 hover:underline">S'inscrire</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}