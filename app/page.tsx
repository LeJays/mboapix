'use client'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion, Variants } from 'framer-motion'
import { 
  Camera, 
  Smartphone, 
  Zap, 
  CheckCircle2, 
  Sun, 
  Moon, 
  PlayCircle,
  HardDrive,
  PlugZap,
  Laptop
} from 'lucide-react'

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
}

export default function MboaPixOfficial() {
  const { theme, setTheme } = useTheme()
  const [isAnnual, setIsAnnual] = useState(false);
  const [mounted, setMounted] = useState(false)

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  // Lien WhatsApp unique
  const whatsappLink = "https://wa.me/237698642798?text=Bonjour%20MboaPix%2C%20je%20souhaite%20en%20savoir%20plus.";

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-[#f5f5f5] transition-colors duration-500 font-sans text-xs overflow-x-hidden">
      
    {/* --- HEADER AVEC ANIMATION PHOTOGRAPHE --- */}
<motion.nav 
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900 px-4 md:px-8 py-4 flex items-center justify-between"
>
  <div className="flex items-center gap-10">
    <motion.div 
      className="flex items-center gap-3 cursor-pointer group" 
      onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
      whileHover="hover"
    >
      {/* Conteneur Logo avec Animation Shutter (Obturateur) */}
      <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center overflow-hidden rounded-lg bg-gray-50 dark:bg-white/5">
        <motion.img 
          src="/vercel.svg" 
          alt="MboaPix Logo" 
          className="h-6 md:h-7 w-auto object-contain z-10 transition-all duration-300 group-hover:scale-110 dark:invert"
          style={{ filter: 'drop-shadow(0px 0px 2px rgba(255,255,255,0.5))' }} 
        />
        
        <motion.div 
          variants={{
            hover: { scale: [0, 1.5], opacity: [0, 0.3, 0] }
          }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-white rounded-full z-20 pointer-events-none"
        />
      </div>

      <div className="flex flex-col">
        <span className="text-lg md:text-xl font-bold tracking-tighter text-gray-900 dark:text-white leading-none">
          Mboa<span className="text-orange-600">Pix</span>
        </span>
        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[2px] text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Capture l'instant
        </span>
      </div>
    </motion.div>

    <div className="hidden lg:flex gap-8 text-[11px] font-black uppercase tracking-[2px] opacity-60">
      <button onClick={() => scrollTo('pourquoi')} className="hover:text-orange-600 transition-colors">Pourquoi ?</button>
      <button onClick={() => scrollTo('tarifs')} className="hover:text-orange-600 transition-colors">Tarifs</button>
    </div>
  </div>

  <div className="flex items-center gap-2 md:gap-4">
    <a href="/connexion" className="hidden md:block text-sm font-bold px-5 py-2 hover:text-orange-600 transition-colors">Se connecter</a>
    <a href="/inscription" className="bg-orange-600 text-white px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform">
      Démarrer
    </a>
  </div>
</motion.nav>

      {/* --- HERO SECTION --- */}
<section className="relative h-screen min-h-[600px] w-full flex items-center overflow-hidden">
  
  <div className="absolute inset-0 z-0">
    <img 
      src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2000&auto=format&fit=crop" 
      alt="Hero" 
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
    <div className="absolute inset-0 bg-black/20"></div> 
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full">
    <motion.div 
      initial={{ opacity: 0, x: -50 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ duration: 1 }}
      className="max-w-2xl"
    >
      <span className="inline-block px-4 py-1 rounded-full bg-orange-600 text-white text-[9px] font-black uppercase tracking-[3px] mb-6">
        L'excellence au Cameroun 🇨🇲
      </span>
      
      <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1] mb-8">
        Livre tes photos <br /> 
        <span className="text-orange-500">comme un pro.</span>
      </h1>
      
      <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed font-medium max-w-lg">
        Créez des galeries de luxe, protégez vos œuvres et encaissez vos paiements par Mobile Money.
      </p>

      <div className="flex flex-wrap gap-4">
        <a href="/inscription" className="bg-orange-600 text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-white hover:text-orange-600 transition-all transform hover:scale-105">
          Commencer gratuitement
        </a>
        <button onClick={() => scrollTo('pourquoi')} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
          Voir plus
        </button>
      </div>
    </motion.div>
  </div>

  <motion.div 
    animate={{ y: [0, 10, 0] }} 
    transition={{ repeat: Infinity, duration: 2 }}
    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 hidden md:flex"
  >
    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
      <div className="w-1 h-2 bg-orange-600 rounded-full"></div>
    </div>
  </motion.div>
</section>

      {/* --- BENTO GRID --- */}
      <section id="pourquoi" className="py-24 px-6 md:px-8 max-w-7xl mx-auto border-t border-gray-50 dark:border-gray-900">
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-12 text-center md:text-left">Pourquoi MboaPix ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Fini les clés USB", icon: <PlugZap />, desc: "Plus de frais de matériel. Livraison 100% digitale instantanée." },
            { title: "Qualité HD préservée", icon: <Camera />, desc: "Algorithme de compression sans perte de détails pour vos mariages." },
            { title: "Paiement Local", icon: <Smartphone />, desc: "Encaissez via MTN & Orange Money en toute sécurité au Cameroun." }
          ].map((item, i) => (
            <div key={i} className="group p-8 bg-gray-50 dark:bg-[#0d0d0d] border border-transparent dark:border-gray-800 rounded-[2.5rem] hover:border-orange-500 transition-all duration-500">
              <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center text-orange-600 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold mb-3">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- TARIFS --- */}
      <section id="tarifs" className="py-20 md:py-40 px-6 md:px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-6xl font-black tracking-tighter mb-8">Segmenté pour <span className="text-orange-600">votre succès.</span></h2>
          <div className="flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-[3px]">
            <span className={!isAnnual ? "text-orange-600" : "opacity-40"}>Mensuel</span>
            <button onClick={() => setIsAnnual(!isAnnual)} className="w-12 h-6 md:w-14 md:h-7 bg-gray-200 dark:bg-gray-800 rounded-full relative p-1 transition-colors">
              <motion.div animate={{ x: isAnnual ? 24 : 0 }} className="w-4 h-4 md:w-5 md:h-5 bg-orange-600 rounded-full shadow-sm" />
            </button>
            <span className={isAnnual ? "text-orange-600" : "opacity-40"}>Annuel (-20%)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Mboa Free", monthly: "0", annual: "0", storage: "2 Go", features: ["10 Galeries", "Photos HD", "Branding Mboa"], icon: <PlayCircle size={16}/> },
            { name: "Mboa Starter", monthly: "3 000", annual: "30 000", storage: "10 Go", features: ["Vidéos (30 min)", "Zéro Branding", "Filigrane Perso"], icon: <Zap size={16}/>, highlight: true },
            { name: "Mboa Pro", monthly: "7 000", annual: "70 000", storage: "50 Go", features: ["Vidéos (2h)", "Sélection Album Pro", "Stats Avancées"], icon: <Camera size={16}/> },
            { name: "Mboa Studio", monthly: "15 000", annual: "150 000", storage: "500 Go", features: ["Espace Massif", "Multi-comptes", "Marque Blanche"], icon: <HardDrive size={16}/> }
          ].map((plan, i) => (
            <motion.div key={i} whileHover={{ y: -8 }} className={`p-8 rounded-[40px] flex flex-col border transition-all duration-500 ${plan.highlight ? "border-orange-600 bg-white dark:bg-black shadow-2xl md:scale-105 z-10" : "border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-[#0d0d0d]"}`}>
              <div className="flex justify-between items-center mb-8">
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-600">{plan.icon}</div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">{plan.name}</h4>
              </div>
              <div className="text-3xl md:text-4xl font-black mb-1 tracking-tighter">
                {isAnnual ? plan.annual : plan.monthly}
                <span className="text-[10px] text-gray-400 ml-1 font-normal">FCFA</span>
              </div>
              <p className="text-orange-600 font-bold text-[10px] uppercase mb-8 tracking-widest">{plan.storage} Stockage</p>
              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">
                    <CheckCircle2 size={14} className="text-green-500" /> {f}
                  </li>
                ))}
              </ul>
              <a href={whatsappLink} className={`w-full py-5 rounded-2xl text-center font-black text-[10px] uppercase tracking-widest transition-all ${plan.highlight ? "bg-orange-600 text-white shadow-xl shadow-orange-500/20" : "bg-black dark:bg-white text-white dark:text-black hover:opacity-80"}`}>
                Sélectionner
              </a>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-12 text-[10px] text-gray-400 font-black uppercase tracking-[3px]">
          Déjà utilisé par les meilleurs studios du Cameroun 🇨🇲
        </p>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-16 bg-gray-50 dark:bg-[#050505] px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-600" />
            <span className="text-lg font-bold">MboaPix</span>
          </div>
          <div className="flex gap-6 md:gap-10 text-[9px] font-black uppercase tracking-widest opacity-40">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors">Support WhatsApp</a>
            <button className="hover:text-orange-600">Facebook</button>
            <button className="hover:text-orange-600" onClick={() => scrollTo('tarifs')}>Tarifs</button>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[4px] opacity-20 text-center md:text-right">© 2026 MboaPix Studio.</p>
        </div>
      </footer>
    </div>
  )
}