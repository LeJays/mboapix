'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase' // Assure-toi que ce chemin est correct
import { User, Mail, Phone, ArrowRight, CheckCircle2, Lock } from 'lucide-react'

export default function Inscription() {
  const [step, setStep] = useState(1) // 1: Formulaire, 2: Vérification Email
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Création de l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insertion dans ta table public.profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: authData.user.id, 
              full_name: formData.name, 
              phone_number: formData.phone,
              email: formData.email,
              subscription_tier: 'free'
            }
          ]);

        if (profileError) throw profileError;

        setStep(2); // Affiche l'écran de vérification email
      }
    } catch (error: any) {
      alert(error.message || "Une erreur est survenue");
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-white flex items-center justify-center p-6 font-sans">
      
      {/* Background Decoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-12 group">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">M</div>
          <span className="text-2xl font-black tracking-tighter">Mboa<span className="text-orange-600">Pix</span></span>
        </Link>

        {step === 1 ? (
          <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-100 dark:border-gray-900 p-8 md:p-10 rounded-[2.5rem] shadow-xl">
            <h1 className="text-2xl font-black tracking-tighter mb-2">Créer un compte</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Rejoignez l'élite des photographes</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nom Complet */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="text"
                    placeholder="Ex: Jean Photo"
                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-orange-600 outline-none transition-all"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email professionnel</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="email"
                    placeholder="jean@exemple.com"
                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-orange-600 outline-none transition-all"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Numéro de téléphone</label>
                <div className="relative flex">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 dark:border-gray-800 pr-3">
                    <span className="text-xs font-bold">🇨🇲 +237</span>
                  </div>
                  <input 
                    required
                    type="tel"
                    placeholder="6xx xxx xxx"
                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl py-4 pl-24 pr-4 text-sm focus:border-orange-600 outline-none transition-all"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-orange-600 outline-none transition-all"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[2px] shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer mon studio"} <ArrowRight size={16} />
              </button>
            </form>

            <p className="text-center mt-8 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Déjà membre ? <Link href="/connexion" className="text-orange-600 hover:underline">Se connecter</Link>
            </p>
          </div>
        ) : (
          /* --- ÉTAPE VÉRIFICATION --- */
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-100 dark:border-gray-900 p-10 rounded-[2.5rem] text-center shadow-xl"
          >
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-4">Vérifiez votre email</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              Un lien de confirmation a été envoyé à <br />
              <span className="font-bold text-[#1a1a1a] dark:text-white">{formData.email}</span>. 
              Cliquez sur le lien pour activer votre compte.
            </p>
            <button 
              onClick={() => setStep(1)}
              className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:opacity-70 transition-opacity"
            >
              Renvoyer l'email
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}