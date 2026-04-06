'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react'

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      setSubmitted(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-white flex items-center justify-center p-6 font-sans">
      
      {/* Background Decoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Retour */}
        <Link href="/connexion" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors mb-8 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Retour à la connexion
        </Link>

        {!submitted ? (
          <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-100 dark:border-gray-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl">
            <h1 className="text-2xl font-black tracking-tighter mb-2">Mot de passe oublié ?</h1>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8 leading-relaxed">
              Entrez votre email pour recevoir un lien de récupération.
            </p>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold uppercase tracking-widest">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email du compte</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="email"
                    placeholder="votre@email.com"
                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-orange-600 transition-all"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[2px] shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Envoyer le lien"} <Send size={16} />
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
            <h2 className="text-2xl font-black tracking-tighter mb-4">Vérifiez vos emails</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              Si un compte existe pour <span className="font-bold text-[#1a1a1a] dark:text-white">{email}</span>, 
              un lien de réinitialisation vient d'être envoyé.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:opacity-70 transition-opacity"
            >
              Essayer une autre adresse
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}