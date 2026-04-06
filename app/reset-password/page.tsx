'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    // Supabase utilise le token présent dans l'URL automatiquement
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // Redirection après 3 secondes vers la connexion
      setTimeout(() => router.push('/connexion'), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-white flex items-center justify-center p-6 font-sans">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {!success ? (
          <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-100 dark:border-gray-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl">
            <h1 className="text-2xl font-black tracking-tighter mb-2">Nouveau mot de passe</h1>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">
              Choisissez un mot de passe robuste pour votre studio.
            </p>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold uppercase tracking-widest">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-orange-600 transition-all"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[2px] shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Mise à jour..." : "Enregistrer"} <ArrowRight size={16} />
              </button>
            </form>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-100 dark:border-gray-900 p-10 rounded-[2.5rem] text-center shadow-xl"
          >
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-4">Mot de passe mis à jour !</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Votre mot de passe a été modifié avec succès. Redirection vers la page de connexion...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}