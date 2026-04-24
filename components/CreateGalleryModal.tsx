'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Camera, Calendar, MapPin, Lock as LockIcon, Globe } from 'lucide-react'

export default function CreateGalleryModal({ isOpen, onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    location: '',
    is_protected: false,
    password: ''
  })

  if (!isOpen) return null

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('galleries')
      .insert([{
        event_name: formData.event_name,
        event_date: formData.event_date,
        location: formData.location,
        photographer_id: user.id,
        is_protected: formData.is_protected,
        password: formData.is_protected ? formData.password : null,
        slug: `${generateSlug(formData.event_name)}-${Math.floor(Math.random() * 1000)}`
      }])

    if (error) {
      alert("Erreur: " + error.message)
    } else {
      onRefresh()
      onClose()
      setFormData({ event_name: '', event_date: '', location: '', is_protected: false, password: '' })
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0d0d0d] w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative border border-gray-100 dark:border-gray-900">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-orange-600 transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black tracking-tighter mb-2 text-gray-900 dark:text-white">Créer un Studio</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-8">Nouveau projet MboaPix</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom de l'événement */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nom de l'événement</label>
            <div className="relative">
              <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required 
                type="text" 
                placeholder="Ex: Mariage de Samuel & Manuella" 
                className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-orange-600 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                onChange={e => setFormData({...formData, event_name: e.target.value})} 
              />
            </div>
          </div>

          {/* Date et Lieu */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required 
                  type="date" 
                  className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-orange-600 transition-all text-gray-900 dark:text-white appearance-none"
                  onChange={e => setFormData({...formData, event_date: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Lieu</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Yaoundé..." 
                  className="w-full bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-orange-600 transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Protection */}
          <div className="p-4 bg-gray-50 dark:bg-black/40 rounded-2xl border border-gray-100 dark:border-gray-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {formData.is_protected ? <LockIcon size={16} className="text-orange-600"/> : <Globe size={16} className="text-green-500"/>}
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">Protection par mot de passe</span>
              </div>
              <input 
                type="checkbox" 
                className="accent-orange-600 h-4 w-4" 
                onChange={e => setFormData({...formData, is_protected: e.target.checked})} 
              />
            </div>
            
            {formData.is_protected && (
              <input 
                required
                type="password" 
                placeholder="Définir le mot de passe" 
                className="w-full bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-gray-800 rounded-xl py-3 px-4 text-xs outline-none focus:border-orange-600 text-gray-900 dark:text-white"
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-orange-600/20 mt-4 disabled:opacity-50 hover:bg-orange-700 transition-colors"
          >
            {loading ? 'Création en cours...' : 'Générer la galerie'}
          </button>
        </form>
      </div>
    </div>
  )
}