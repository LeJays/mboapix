'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ChevronLeft,Plus,Image as ImageIcon,Eye,UploadCloud,Loader2,X,Check,LayoutGrid,Paintbrush,
  Settings,Share2,Monitor,Type,Heart,Download,Share,Play
} from 'lucide-react'



// 1. DÉFINITION DU TYPE POUR ÉVITER L'ERREUR TS
type CoverStyle = 
  | 'Center' | 'Love' | 'Left' 
  | 'Novel' | 'Vintage' | 'Frame' 
  | 'Stripe' | 'Divider' | 'Journal' 
  | 'Stamp' | 'Outline' | 'Classic' | 'None';

// 1. DÉFINITION DU TYPE TYPO
type TypographyStyle = 'Sans' | 'Serif' | 'Modern' | 'Timeless' | 'Bold' | 'Subtle';

// 2. CONFIGURATION DES CLASSES (À adapter selon tes polices installées)
const typographyConfig = {
  Sans: 'font-sans tracking-normal',
  Serif: 'font-serif tracking-normal',
  Modern: 'font-sans tracking-[0.2em] font-light uppercase',
  Timeless: 'font-serif italic tracking-wide font-light',
  Bold: 'font-sans font-black uppercase tracking-tighter',
  Subtle: 'font-sans font-thin tracking-[0.3em] uppercase opacity-70'
};
// TYPES POUR LA GRILLE
type GridStyle = 'Vertical' | 'Horizontal';
type ThumbnailSize = 'Regular' | 'Large';
type GridSpacing = 'Regular' | 'Large';
type NavigationStyle = 'Icon Only' | 'Icon & Text';

// CONFIGURATION DES CLASSES DYNAMIQUES
const gridConfig = {
  columns: {
    Regular: 'columns-2 sm:columns-3 lg:columns-4',
    Large: 'columns-1 sm:columns-2 lg:columns-2'
  },
  gap: {
    Regular: 'gap-1 space-y-1',
    Large: 'gap-8 space-y-8'
  }
};

type SettingsTab = 'general' | 'privacy' | 'download' | 'favorites' | 'store';
type ColorPalette = 'Light' | 'Gold' | 'Rose' | 'Terracotta' | 'Sand' | 'Olive' | 'Agave' | 'Sea' | 'Dark';

const colorConfigs: Record<ColorPalette, { bg: string; accent: string; text: string; border: string }> = {
  Light: { bg: '#FFFFFF', accent: '#EA580C', text: '#111827', border: '#F3F4F6' },
  Gold: { bg: '#FAF9F6', accent: '#A68966', text: '#433422', border: '#EFEBE5' },
  Rose: { bg: '#FFF9F9', accent: '#A67B7B', text: '#4A3535', border: '#F5E8E8' },
  Terracotta: { bg: '#FDF8F5', accent: '#A66D4F', text: '#4A2E1F', border: '#F2E3DB' },
  Sand: { bg: '#F9F7F5', accent: '#8C7A6B', text: '#3D352F', border: '#EEEAE6' },
  Olive: { bg: '#F9FAF7', accent: '#8C9475', text: '#383D2E', border: '#EDF0E6' },
  Agave: { bg: '#F7F9F8', accent: '#789489', text: '#2E3D38', border: '#E6EFEA' },
  Sea: { bg: '#F6F7F9', accent: '#7D8494', text: '#2E323D', border: '#E6E9EF' },
  Dark: { bg: '#080808', accent: '#EA580C', text: '#FFFFFF', border: '#1F2937' },
};

export default function GalleryManagePage() {
  const [palette, setPalette] = useState<ColorPalette>('Light');
  const [gridStyle, setGridStyle] = useState<GridStyle>('Vertical');
  const [thumbnailSize, setThumbnailSize] = useState<ThumbnailSize>('Regular');
  const [gridSpacing, setGridSpacing] = useState<GridSpacing>('Regular');
  const [navStyle, setNavStyle] = useState<NavigationStyle>('Icon Only');
  const [typography, setTypography] = useState<TypographyStyle>('Sans');
  const params = useParams()
  const slug = params.slug
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [gallery, setGallery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [activeSet, setActiveSet] = useState('Toutes les photos')
  const [photos, setPhotos] = useState<any[]>([])
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light')
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('general')

  // 2. ÉTAT TYPÉ POUR LES COVERS
  const [coverStyle, setCoverStyle] = useState<CoverStyle>('Center');

  const [activeTab, setActiveTab] = useState<'mediatheque' | 'design' | 'settings' | 'share'>('mediatheque')
  const [designSection, setDesignSection] = useState<'layout' | 'typography' | 'colors' | 'cover'>('layout')
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<'upload' | 'album'>('upload')
  const [tempSelectedCover, setTempSelectedCover] = useState<string | null>(null)
  const [updatingCover, setUpdatingCover] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isToastVisible, setIsToastVisible] = useState(false)
  
  // Près de tes autres useState
const [settings, setSettings] = useState({
  slug: '', // Directement dans la table
  // Le reste va dans l'objet JSON 'theme'
  category_tags: '',
  watermark: 'Pas de filigrane',
  expiration_date: '',
  email_registration: false,
  gallery_help: false,
  slideshow: false,
  social_sharing: true,
  language: 'Français',
  show_on_homepage: true,
  // Nouveaux champs pour la confidentialité
  is_protected: false, 
  password: '',
  //Pour les téléchargements
  enable_download: true,
  download_pin_enabled: false,
  download_pin: '6408',
  allow_high_res: true,
  allow_web_size: true,
  enable_favorites: true,
  require_email_favorites: false,
  allow_favorite_notes: true,
  allow_wa_share: true,
  allow_fb_share: true,
  show_qr_code: true,
});
const saveGeneralSettings = async () => {
  try {
    setUploading(true);

    // 1. On prépare l'objet JSONB 'theme'
    // On y met tout ce qui n'a pas de colonne dédiée dans la table SQL
    const updatedTheme = {
      ...(gallery?.theme || {}),
      // Général
      category_tags: settings.category_tags,
      watermark: settings.watermark,
      expiration_date: settings.expiration_date,
      email_registration: settings.email_registration,
      gallery_help: settings.gallery_help,
      slideshow: settings.slideshow,
      social_sharing: settings.social_sharing,
      language: settings.language,
      
      // Confidentialité (optionnel en JSON car déjà en colonnes SQL, mais utile pour le toggle homepage)
      show_on_homepage: settings.show_on_homepage,

      // Téléchargement (Stocké ici car pas de colonnes SQL dédiées)
      enable_download: settings.enable_download,
      download_pin_enabled: settings.download_pin_enabled,
      download_pin: settings.download_pin,
      allow_high_res: settings.allow_high_res,
      allow_web_size: settings.allow_web_size,
      enable_favorites: settings.enable_favorites,
      require_email_favorites: settings.require_email_favorites,
      allow_favorite_notes: settings.allow_favorite_notes,
    };

    // 2. MISE À JOUR BASE DE DONNÉES
    const { error } = await supabase
      .from('galleries')
      .update({ 
        // Colonnes SQL directes
        slug: settings.slug,
        event_name: settings.slug, 
        is_protected: settings.is_protected,
        password: settings.password,
        // Colonne JSONB pour tout le reste
        theme: updatedTheme 
      })
      .eq('id', gallery.id);

    if (error) throw error;

    // 3. Mise à jour de l'état local pour l'UI
    setGallery({ 
      ...gallery, 
      slug: settings.slug, 
      event_name: settings.slug,
      is_protected: settings.is_protected,
      password: settings.password,
      theme: updatedTheme 
    });
    
    alert("Tous les paramètres ont été synchronisés avec la base de données !");

  } catch (error) {
    console.error("Erreur Supabase:", error);
    alert("Erreur lors de la mise à jour");
  } finally {
    setUploading(false);
  }
};

// Fonction pour mettre à jour l'état localement
const handleSettingChange = (key: string, value: any) => {
  setSettings(prev => ({ ...prev, [key]: value }));
};

  useEffect(() => {
  async function loadData() {
    setLoading(true); // Début du chargement
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Récupération de la galerie avec le profil du photographe
    const { data: g, error: gError } = await supabase
      .from('galleries')
      .select(`
        *,
        profiles:photographer_id (
          full_name,
          avatar_url
        )
      `)
      .eq('slug', slug)
      .single();

    if (gError || !g) {
      router.push('/dashboard/galleries');
      return;
    }

    setGallery(g);
    setTempSelectedCover(g.cover_url);

    // 1. INITIALISATION DES RÉGLAGES GÉNÉRAUX (Settings)
    // On extrait les valeurs du JSONB 'theme' ou on met des valeurs par défaut
    setSettings({
  slug: g.slug || '',
  category_tags: g.theme?.category_tags || '',
  watermark: g.theme?.watermark || 'Pas de filigrane',
  expiration_date: g.theme?.expiration_date || '',
  email_registration: g.theme?.email_registration || false,
  gallery_help: g.theme?.gallery_help || false,
  slideshow: g.theme?.slideshow || false,
  social_sharing: g.theme?.social_sharing ?? true,
  
  // NOUVEAUX CHAMPS À AJOUTER POUR CORRIGER L'ERREUR
  allow_wa_share: g.theme?.allow_wa_share ?? true,
  allow_fb_share: g.theme?.allow_fb_share ?? true,
  show_qr_code: g.theme?.show_qr_code ?? true,

  language: g.theme?.language || 'Français',
  is_protected: g.is_protected || false,
  password: g.password || '',
  show_on_homepage: g.theme?.show_on_homepage ?? true,
  enable_download: g.theme?.enable_download ?? true,
  download_pin_enabled: g.theme?.download_pin_enabled ?? false,
  download_pin: g.theme?.download_pin || '',
  allow_high_res: g.theme?.allow_high_res ?? true,
  allow_web_size: g.theme?.allow_web_size ?? true,
  enable_favorites: g.theme?.enable_favorites ?? true,
  require_email_favorites: g.theme?.require_email_favorites ?? false,
  allow_favorite_notes: g.theme?.allow_favorite_notes ?? true,
});

    // 2. CHARGEMENT DU DESIGN (Typo + Grid + CoverStyle)
    if (g.theme) {
      if (g.theme.coverStyle) setCoverStyle(g.theme.coverStyle);
      if (g.theme.typography) setTypography(g.theme.typography);
      if (g.theme.gridStyle) setGridStyle(g.theme.gridStyle);
      if (g.theme.thumbnailSize) setThumbnailSize(g.theme.thumbnailSize);
      if (g.theme.gridSpacing) setGridSpacing(g.theme.gridSpacing);
      if (g.theme.navStyle) setNavStyle(g.theme.navStyle);
      if (g.theme.palette) setPalette(g.theme.palette);
    } else {
      // Valeurs par défaut du design si le thème est vide
      setCoverStyle('Center');
      setTypography('Sans');
      setGridStyle('Vertical');
      setThumbnailSize('Regular');
      setGridSpacing('Regular');
      setNavStyle('Icon Only');
    }

    // 3. CHARGEMENT DES PHOTOS
    const { data: p, error: pError } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('gallery_id', g.id)
      .order('created_at', { ascending: false });

    if (!pError) {
      setPhotos(p || []);
    }

    setLoading(false);
  }

  loadData();
}, [slug, router]);

  useEffect(() => {
    if (isCoverModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => { document.body.style.overflow = 'auto' }
  }, [isCoverModalOpen])

  const handleConfirmCover = async () => {
    if (!tempSelectedCover) return
    setUpdatingCover(true)
    try {
      const { error } = await supabase
        .from('galleries')
        .update({ cover_url: tempSelectedCover })
        .eq('id', gallery.id)

      if (error) throw error
      setGallery({ ...gallery, cover_url: tempSelectedCover })
      setIsCoverModalOpen(false)
    } catch (error) {
      console.error("Erreur cover:", error)
    } finally {
      setUpdatingCover(false)
    }
  }

  const handleDelete = async (photo: any) => {
    if (!confirm("Supprimer cette photo ?")) return;
    const fileName = photo.storage_path || photo.file_path || photo.url?.split('/').pop();
    try {
      if (fileName) {
        await fetch('/api/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName }),
        });
      }
      await supabase.from('gallery_photos').delete().eq('id', photo.id);
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleUpload = async (e: any) => {
    const files = e.target?.files || e.dataTransfer?.files
    if (!files || files.length === 0) return

    setUploading(true)
    setIsToastVisible(true)
    let currentCover = gallery?.cover_url

    for (const file of Array.from(files)) {
      try {
        const fileId = `${Date.now()}-${(file as File).name.replace(/\s+/g, '_')}`
        const storageKey = `${gallery.id}/${activeSet}/${fileId}`
        setUploadProgress(prev => ({ ...prev, [(file as File).name]: 0 }))

        const formData = new FormData()
        formData.append('file', file as File)
        formData.append('fileName', storageKey)

        const publicUrl = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', '/api/upload')
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100)
              setUploadProgress(prev => ({ ...prev, [(file as File).name]: percent }))
            }
          }
          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve(JSON.parse(xhr.responseText).url) : reject()
          xhr.send(formData)
        })

        const { data: newPhoto } = await supabase
          .from('gallery_photos')
          .insert([{
            gallery_id: gallery.id,
            name: (file as File).name,
            url: publicUrl,
            file_path: storageKey,
            display_url: publicUrl,
            storage_path: storageKey,
            set_name: activeSet,
            size: (file as File).size
          }])
          .select()
          .single()

        if (newPhoto) {
          setPhotos(prev => [newPhoto, ...prev])
          if (!currentCover) {
            await supabase.from('galleries').update({ cover_url: publicUrl }).eq('id', gallery.id)
            currentCover = publicUrl
            setGallery((prev: any) => ({ ...prev, cover_url: publicUrl }))
          }
        }
      } catch (error) {
        console.error("Upload error:", error)
      }
    }
    
    setUploading(false)
    setTimeout(() => { setIsToastVisible(false); setUploadProgress({}); }, 3000)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-black uppercase italic tracking-tighter dark:text-white">MboaPix...</span>
      </div>
    </div>
  )

  const saveDesignSettings = async () => {
    try {
      setUploading(true);
      
      // On prépare l'objet theme avec TOUTES les options
      const updatedTheme = {
        ...(gallery?.theme || {}),
        coverStyle: coverStyle,
        typography: typography,
        gridStyle: gridStyle,
        thumbnailSize: thumbnailSize,
        gridSpacing: gridSpacing,
        navStyle: navStyle,
        palette: palette
      };

      const { error } = await supabase
        .from('galleries')
        .update({ theme: updatedTheme })
        .eq('id', gallery.id);

      if (error) throw error;
      
      // Optionnel : Mettre à jour l'état local pour que l'interface soit synchro
      setGallery({ ...gallery, theme: updatedTheme });
      
      alert("Design enregistré avec succès !");
    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-screen bg-white dark:bg-[#050505] flex flex-col text-gray-900 dark:text-white relative font-sans overflow-hidden">
      
      <header className="h-14 border-b border-gray-100 dark:border-white/5 px-4 flex items-center justify-between bg-white dark:bg-[#080808] shrink-0 z-50">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => router.push('/dashboard/galleries')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all text-gray-400">
            <ChevronLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[9px] md:text-[11px] font-black uppercase tracking-widest truncate max-w-[100px] md:max-w-none">
              {gallery?.event_name}
            </h1>
            <div className={`px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-600 w-fit`}>
              Gestionnaire
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => window.open(`/gallery/${slug}`, '_blank')} className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
            <Eye size={18} />
          </button>
          <button className="bg-orange-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-700 transition-colors">
            Publier
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:flex w-64 border-r border-gray-100 dark:border-white/5 flex-col bg-[#fafafa] dark:bg-[#080808] z-30 shrink-0">
          <div className="p-5 flex flex-col gap-6">
            <div 
              onClick={() => { setModalStep('upload'); setIsCoverModalOpen(true); }}
              className="aspect-[4/3] rounded-2xl bg-gray-200 dark:bg-white/5 overflow-hidden border border-gray-200 dark:border-white/10 relative group cursor-pointer shadow-sm"
            >
              {gallery?.cover_url ? (
                <img src={gallery.cover_url} className="w-full h-full object-cover transition-all group-hover:scale-105" alt="Cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={24}/></div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Changer la une</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 px-1">
              <button onClick={() => setActiveTab('mediatheque')} className={`relative pb-2 transition-all ${activeTab === 'mediatheque' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={20} />{activeTab === 'mediatheque' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-orange-600 rounded-full" />}</button>
              <button onClick={() => setActiveTab('design')} className={`relative pb-2 transition-all ${activeTab === 'design' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}><Paintbrush size={20} />{activeTab === 'design' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-orange-600 rounded-full" />}</button>
              <button onClick={() => setActiveTab('settings')} className={`relative pb-2 transition-all ${activeTab === 'settings' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}><Settings size={20} />{activeTab === 'settings' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-orange-600 rounded-full" />}</button>
              <button onClick={() => setActiveTab('share')} className={`relative pb-2 transition-all ${activeTab === 'share' ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}><Share2 size={20} />{activeTab === 'share' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-orange-600 rounded-full" />}</button>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Statistiques</span>
              <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Total Images</p>
                <p className="text-2xl font-black italic tracking-tighter">{photos.length}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden bg-white dark:bg-black flex flex-col">
          {activeTab === 'mediatheque' ? (
            <div className="flex-1 p-8 md:p-12 overflow-y-auto">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Médiathèque</h2>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} strokeWidth={3} className="text-orange-600"/>}
                  Ajouter des photos
                </button>
                <input type="file" ref={fileInputRef} onChange={handleUpload} multiple accept="image/*" className="hidden" />
              </div>

              {photos.length === 0 ? (
                <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/10 rounded-[4rem] min-h-[400px] cursor-pointer hover:bg-gray-50/50 transition-all">
                  <UploadCloud size={48} className="text-gray-300 mb-4" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Aucune photo dans cette galerie</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 shadow-sm">
                      <img src={photo.display_url || photo.url} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" alt={photo.name} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                        <button onClick={() => handleDelete(photo)} className="p-3 bg-red-500 text-white rounded-full shadow-xl hover:bg-red-600 hover:scale-110 transition-all"><X size={18} strokeWidth={3} /></button>
                        <span className="text-[8px] font-black text-white uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">{photo.name?.substring(0, 15)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'design' ? (
            <div className="flex flex-col lg:flex-row h-full animate-in fade-in duration-500 overflow-hidden">
              {/* MENU DESIGN GAUCHE (CONSERVÉ) */}
              <div className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/5 bg-white dark:bg-[#080808] p-6 lg:p-8 overflow-y-auto shrink-0">
                <div className="mb-10">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Design</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Configuration visuelle</p>
                </div>

                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-2 border-b border-gray-100 dark:border-white/5 pb-6">
                    <button onClick={() => setDesignSection('layout')} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${designSection === 'layout' ? 'bg-orange-600 text-white border-orange-600' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}><LayoutGrid size={14}/> Grid</button>
                    <button onClick={() => setDesignSection('typography')} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${designSection === 'typography' ? 'bg-orange-600 text-white border-orange-600' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}><Type size={14}/> Typo</button>
                    <button onClick={() => setDesignSection('colors')} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border ${designSection === 'colors' ? 'bg-orange-600 text-white border-orange-600' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}><Paintbrush size={14}/> Color</button>
                    <button onClick={() => setDesignSection('cover')} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${designSection === 'cover' ? 'bg-orange-600 text-white border-orange-600' : 'text-gray-400 border-transparent hover:bg-gray-50'}`}><ImageIcon size={14}/> Cover</button>
                  </div>

                  {designSection === 'cover' && (
                    <div className="space-y-6 animate-in slide-in-from-left-4 pb-20">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: 'Center', label: 'Center', desc: 'Titre au centre' },
                          { id: 'Left', label: 'Left', desc: 'Titre à gauche' },
                          { id: 'Stripe', label: 'Stripe', desc: 'Bandeau central' },
                          { id: 'Outline', label: 'Outline', desc: 'Cadre fin' },
                          { id: 'Classic', label: 'Classic', desc: 'Style intemporel' },
                          { id: 'Love', label: 'Love', desc: 'Typo géante' },
                          { id: 'Novel', label: 'Novel', desc: 'Format magazine' },
                          { id: 'Vintage', label: 'Vintage', desc: 'Look rétro' },
                          { id: 'Frame', label: 'Frame', desc: 'Cadre large' },
                          { id: 'Divider', label: 'Divider', desc: 'Séparation nette' },
                          { id: 'Journal', label: 'Journal', desc: 'Minimaliste' },
                          { id: 'Stamp', label: 'Stamp', desc: 'Cercle flottant' },
                          { id: 'None', label: 'None', desc: 'Sans couverture' }
                        ].map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setCoverStyle(style.id as CoverStyle)}
                            className={`group relative flex flex-col gap-3 p-4 border-2 transition-all text-left ${
                              coverStyle === style.id 
                                ? 'border-orange-600 bg-orange-50/5' 
                                : 'border-gray-100 dark:border-white/5 hover:border-gray-200'
                            }`}
                          >
                            {/* Mini icône de prévisualisation schématique */}
                            <div className="aspect-video w-full bg-gray-50 dark:bg-white/5 flex items-center justify-center rounded-lg border border-gray-100 dark:border-white/10">
                              <div className={`w-12 h-8 border-2 border-dashed border-gray-300 dark:border-white/20 relative`}>
                                {style.id === 'Center' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-0.5 bg-orange-600" /></div>}
                                {style.id === 'Left' && <div className="absolute inset-y-0 left-1 flex items-center"><div className="w-4 h-0.5 bg-orange-600" /></div>}
                                {style.id === 'Divider' && <div className="absolute inset-y-0 left-1/2 w-0.5 bg-orange-600" />}
                                {style.id === 'Stamp' && <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-orange-600" />}
                              </div>
                            </div>

                            <div className="flex flex-col">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                coverStyle === style.id ? 'text-orange-600' : 'text-gray-600 dark:text-gray-300'
                              }`}>
                                {style.label}
                              </span>
                              <p className="text-[8px] text-gray-400 leading-tight mt-0.5 uppercase tracking-tighter">
                                {style.desc}
                              </p>
                            </div>

                            {/* Badge de sélection */}
                            {coverStyle === style.id && (
                              <div className="absolute top-2 right-2 w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                                <Check size={10} className="text-white" strokeWidth={4} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {designSection === 'colors' && (
                    <div className="space-y-6 animate-in slide-in-from-left-4 pb-20">
                      <div className="grid grid-cols-3 gap-3">
                        {(Object.keys(colorConfigs) as ColorPalette[]).map((p) => (
                          <button 
                            key={p} 
                            onClick={() => setPalette(p)}
                            className={`group flex flex-col gap-2 transition-all`}
                          >
                            <div className={`w-full aspect-[4/3] rounded-xl border-2 flex items-center justify-center gap-1 transition-all ${palette === p ? 'border-orange-600 scale-105 shadow-lg' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/10'}`}>
                              <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: colorConfigs[p].bg }} />
                              <div className="w-3 h-3 rounded-full border border-gray-200 opacity-50" style={{ backgroundColor: colorConfigs[p].bg }} />
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorConfigs[p].accent }} />
                            </div>
                            <span className={`text-[9px] font-bold uppercase text-center ${palette === p ? 'text-orange-600' : 'text-gray-400'}`}>{p}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {designSection === 'typography' && (
                    <div className="space-y-6 animate-in slide-in-from-left-4 pb-20">
                      <div className="grid grid-cols-2 gap-4">
                        {(['Sans', 'Serif', 'Modern', 'Timeless', 'Bold', 'Subtle'] as TypographyStyle[]).map((style) => (
                          <button 
                            key={style} 
                            onClick={() => setTypography(style)}
                            className={`flex flex-col gap-2 p-4 border-2 transition-all text-left ${typography === style ? 'border-orange-600 bg-orange-50/5' : 'border-gray-100 dark:border-white/5'}`}
                          >
                            <div className={`text-xl ${typographyConfig[style]}`}>{style}</div>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                              {style === 'Sans' && 'A neutral font'}
                              {style === 'Serif' && 'A classic font'}
                              {style === 'Modern' && 'A sophisticated font'}
                              {style === 'Timeless' && 'A light and airy font'}
                              {style === 'Bold' && 'A punchy font'}
                              {style === 'Subtle' && 'A minimal font'}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {designSection === 'layout' && (
                    <div className="space-y-8 animate-in slide-in-from-left-4 pb-20">
                      {/* Grid Style */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Grid Style</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {['Vertical', 'Horizontal'].map((style) => (
                            <button key={style} onClick={() => setGridStyle(style as GridStyle)} className={`p-4 border-2 transition-all ${gridStyle === style ? 'border-orange-600 bg-orange-50/5' : 'border-gray-100'}`}>
                              <span className="text-[10px] font-bold uppercase">{style}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Thumbnail Size */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Thumbnail Size</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {['Regular', 'Large'].map((size) => (
                            <button key={size} onClick={() => setThumbnailSize(size as ThumbnailSize)} className={`p-4 border-2 transition-all ${thumbnailSize === size ? 'border-orange-600 bg-orange-50/5' : 'border-gray-100'}`}>
                              <span className="text-[10px] font-bold uppercase">{size}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Grid Spacing */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Grid Spacing</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {['Regular', 'Large'].map((space) => (
                            <button key={space} onClick={() => setGridSpacing(space as GridSpacing)} className={`p-4 border-2 transition-all ${gridSpacing === space ? 'border-orange-600 bg-orange-50/5' : 'border-gray-100'}`}>
                              <span className="text-[10px] font-bold uppercase">{space}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="pt-10">
                    <button 
                      onClick={saveDesignSettings}
                      disabled={uploading}
                      className="w-full bg-orange-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                      {uploading ? 'Enregistrement...' : 'Sauvegarder le style'}
                    </button>
                  </div>
                </div>
              </div>

              {/* APERÇU DROITE (CORRIGÉ) */}
              <div className="flex-1 bg-gray-50 dark:bg-[#030303] p-6 lg:p-12 flex flex-col items-center overflow-y-auto scrollbar-hide">
                {/* LA DIV PRINCIPALE UTILISE MAINTENANT colorConfigs[palette] */}
                <div 
                  className="w-full max-w-7xl min-h-[90vh] shadow-2xl overflow-hidden flex flex-col border transition-all duration-700 mb-20 rounded-3xl"
                  style={{ 
                    backgroundColor: colorConfigs[palette].bg, 
                    color: colorConfigs[palette].text,
                    borderColor: colorConfigs[palette].border 
                  }}
                >
                  {/* BARRE DE DÉCORATION DU NAVIGATEUR */}
                  <div className="h-8 border-b flex items-center px-4 gap-1.5 shrink-0" style={{ borderColor: colorConfigs[palette].border }}>
                    <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: colorConfigs[palette].text }} />
                    <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: colorConfigs[palette].text }} />
                    <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: colorConfigs[palette].text }} />
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {coverStyle !== 'None' && (
                      <div className={`relative w-full transition-all duration-700 ease-in-out
                        ${['Center', 'Left', 'Stripe', 'Outline', 'Classic', 'Love'].includes(coverStyle) ? 'h-[80vh]' : ''}
                        ${coverStyle === 'Novel' ? 'h-[70vh] flex flex-row-reverse' : ''}
                        ${coverStyle === 'Vintage' ? 'h-[85vh] flex flex-col' : ''}
                        ${coverStyle === 'Frame' ? 'h-[80vh] p-10' : ''}
                        ${coverStyle === 'Divider' ? 'h-[80vh] flex' : ''}
                        ${coverStyle === 'Journal' ? 'h-[80vh] flex p-12 gap-12' : ''}
                        ${coverStyle === 'Stamp' ? 'h-[70vh] flex flex-col items-center justify-center' : ''}
                      `}>
                        <div className={`relative overflow-hidden transition-all duration-700
                          ${['Center', 'Left', 'Stripe', 'Outline', 'Classic', 'Love', 'Stamp'].includes(coverStyle) ? 'w-full h-full' : ''}
                          ${coverStyle === 'Novel' ? 'w-1/2 h-full' : ''}
                          ${coverStyle === 'Vintage' ? 'w-full h-3/4' : ''}
                          ${coverStyle === 'Frame' ? 'w-full h-full shadow-2xl' : ''}
                          ${coverStyle === 'Divider' ? 'w-1/2 h-full' : ''}
                          ${coverStyle === 'Journal' ? 'w-2/3 h-full' : ''}
                        `}>
                          {gallery?.cover_url && <img src={gallery.cover_url} className="w-full h-full object-cover" alt="" />}
                          <div className={`absolute inset-0 flex items-center p-12
                            ${coverStyle === 'Center' ? 'justify-center text-center bg-black/20' : ''}
                            ${coverStyle === 'Left' ? 'justify-start text-left bg-black/10' : ''}
                            ${coverStyle === 'Stripe' ? 'justify-center text-center border-y-4 border-white/30 m-20 bg-black/20' : ''}
                            ${coverStyle === 'Outline' ? 'justify-center text-center' : ''}
                            ${coverStyle === 'Love' ? 'justify-center text-center bg-white/10 backdrop-blur-[2px]' : ''}
                          `}>
                            {['Center', 'Left', 'Stripe', 'Outline', 'Classic', 'Frame'].includes(coverStyle) && (
                              <div className={coverStyle === 'Outline' ? 'border-2 border-white p-10' : ''}>
                                <h4 className={`text-white uppercase drop-shadow-2xl ${typographyConfig[typography]} ${coverStyle === 'Outline' ? 'text-5xl' : 'text-6xl'}`}>
                                  {gallery?.event_name}
                                </h4>
                              </div>
                            )}
                            {coverStyle === 'Love' && <h4 className={`text-white uppercase text-[12vw] leading-none opacity-90 drop-shadow-2xl ${typographyConfig[typography]}`}>LOVE</h4>}
                          </div>
                        </div>

                        {['Novel', 'Vintage', 'Divider', 'Journal', 'Stamp'].includes(coverStyle) && (
                          <div className="flex flex-col items-center justify-center p-10 transition-colors" style={{ width: coverStyle === 'Novel' || coverStyle === 'Divider' ? '50%' : '100%', height: coverStyle === 'Vintage' ? '25%' : '100%' }}>
                            {coverStyle === 'Stamp' && <div className="w-16 h-16 overflow-hidden mb-4 border-2 p-1" style={{ borderColor: colorConfigs[palette].accent }}><img src={gallery?.cover_url} className="w-full h-full object-cover" /></div>}
                            <h4 className={`uppercase ${typographyConfig[typography]} ${coverStyle === 'Journal' ? 'text-4xl' : 'text-5xl'}`}>{gallery?.event_name}</h4>
                            <div className="w-12 h-1 mt-4" style={{ backgroundColor: colorConfigs[palette].accent }} />
                            <p className={`text-[10px] opacity-60 uppercase mt-2 ${typographyConfig[typography]}`}>{gallery?.profiles?.full_name}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* BARRE D'ACTION DYNAMIQUE */}
                    <div 
                      className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 border-b backdrop-blur-md transition-all duration-500"
                      style={{ 
                        backgroundColor: `${colorConfigs[palette].bg}E6`, // E6 ajoute de la transparence (90%)
                        borderColor: colorConfigs[palette].border 
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border" style={{ borderColor: colorConfigs[palette].border, backgroundColor: colorConfigs[palette].border }}>
                          {gallery?.profiles?.avatar_url ? (
                            <img src={gallery.profiles.avatar_url} className="w-full h-full object-cover" alt="Logo" />
                          ) : (
                            <span className="text-[10px] font-black opacity-40">{gallery?.profiles?.full_name?.charAt(0) || 'P'}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h3 className={`text-[10px] uppercase ${typographyConfig[typography]}`}>{gallery?.event_name}</h3>
                          <span className={`text-[7px] opacity-60 uppercase ${typographyConfig[typography]}`}>{gallery?.profiles?.full_name || "STUDIO"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <button className="flex items-center gap-2 transition-colors hover:opacity-70" style={{ color: colorConfigs[palette].accent }}>
                          <Heart size={16} />
                          {navStyle === 'Icon & Text' && <span className="text-[9px] font-bold uppercase tracking-wider">Favoris</span>}
                        </button>
                        <button className="flex items-center gap-2 transition-colors hover:opacity-70" style={{ color: colorConfigs[palette].accent }}>
                          <Download size={16} />
                          {navStyle === 'Icon & Text' && <span className="text-[9px] font-bold uppercase tracking-wider">Download</span>}
                        </button>
                        <button className="flex items-center gap-2 transition-colors hover:opacity-70" style={{ color: colorConfigs[palette].accent }}>
                          <Share size={16} />
                          {navStyle === 'Icon & Text' && <span className="text-[9px] font-bold uppercase tracking-wider">Share</span>}
                        </button>
                      </div>
                    </div>

                    {/* RANGEMENT MOSAÏQUE DYNAMIQUE */}
                    <div className={`transition-all duration-500 ${gridSpacing === 'Regular' ? 'p-1 md:p-2' : 'p-8 md:p-16'}`}>
                      <div className={`transition-all duration-500 ${gridConfig.columns[thumbnailSize]} ${gridConfig.gap[gridSpacing]}`}>
                        {photos.map((p, i) => (
                          <div key={i} className="break-inside-avoid overflow-hidden group mb-1">
                            <img 
                              src={p.url} 
                              className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-all duration-700 hover:scale-105" 
                              alt="" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOGGLE LIGHT/DARK (Conserve sa logique mais reste indépendant de la palette design) */}
                <div className="absolute bottom-8 flex gap-4 bg-white dark:bg-[#080808] p-2 rounded-2xl shadow-xl border border-gray-100 dark:border-white/5">
                  <button onClick={() => setPreviewTheme(previewTheme === 'light' ? 'dark' : 'light')} className={`p-3 rounded-xl transition-colors ${previewTheme === 'dark' ? 'text-orange-600 bg-orange-50 dark:bg-orange-600/10' : 'text-gray-400'}`}><Monitor size={20}/></button>
                  <button className="p-3 text-gray-400 hover:text-orange-600 transition-colors"><LayoutGrid size={20}/></button>
                </div>
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#050505] animate-in fade-in duration-500">
    
    {/* MENU PARAMÈTRES GAUCHE */}
    <div className="w-72 border-r border-gray-100 dark:border-white/5 flex flex-col shrink-0 bg-[#fafafa] dark:bg-[#080808]">
      <div className="p-6 border-b border-gray-100 dark:border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Paramètres</h3>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {[
          { id: 'general', label: 'Général', icon: <Settings size={18} /> },
          { id: 'privacy', label: 'Confidentialité', icon: <Eye size={18} /> },
          { id: 'download', label: 'Téléchargement', icon: <Download size={18} />, badge: 'ON' },
          { id: 'favorites', label: 'Favoris', icon: <Heart size={18} />, badge: 'ON' },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setSettingsTab(item.id as SettingsTab)}
            className={`w-full flex items-center justify-between px-4 py-4 rounded-xl text-[12px] font-bold transition-all ${
              settingsTab === item.id 
                ? 'bg-white dark:bg-white/5 text-orange-600 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={settingsTab === item.id ? 'text-orange-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              {item.label}
            </div>
            {item.badge && (
              <span className={`text-[8px] px-2 py-0.5 rounded-full font-black ${
                item.badge === 'ON' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>

    {/* ZONE DE CONTENU DROITE */}
    <div className="flex-1 overflow-y-auto p-8 md:p-16 relative flex flex-col scrollbar-hide pb-40">
      <div className="max-w-2xl w-full mx-auto flex-1 pb-32">
        
        {settingsTab === 'general' && (
  <div className="space-y-12 animate-in slide-in-from-bottom-4 pb-20">
    <div>
      <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Paramètres Généraux</h2>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-orange-600">Configuration de la collection</p>
    </div>

    <div className="space-y-10">
      {/* URL */}
      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">URL de la collection</label>
        <input 
          type="text" 
          value={settings.slug}
          onChange={(e) => handleSettingChange('slug', e.target.value)}
          className="w-full max-w-md bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-orange-600"
        />
      </div>

      {/* Catégories */}
      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">Mots clés de catégorie</label>
        <input 
          type="text" 
          value={settings.category_tags}
          onChange={(e) => handleSettingChange('category_tags', e.target.value)}
          placeholder="mariage, extérieur..." 
          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-600"
        />
      </div>

      {/* Filigrane */}
      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">Filigrane par défaut</label>
        <select 
          value={settings.watermark}
          onChange={(e) => handleSettingChange('watermark', e.target.value)}
          className="w-full max-w-md bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
        >
          <option>Pas de filigrane</option>
          <option>Logo principal</option>
        </select>
      </div>

      {/* Expiration */}
      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">Expiration automatique</label>
        <input 
          type="date" 
          value={settings.expiration_date}
          onChange={(e) => handleSettingChange('expiration_date', e.target.value)}
          className="max-w-[200px] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none" 
        />
      </div>

      <hr className="border-gray-100 dark:border-white/5" />

      {/* Toggles dynamiques */}
      <div className="space-y-6">
        {[
          { key: 'email_registration', label: "Inscription par e-mail", desc: "Suivez les adresses e-mail accédant à cette collection." },
          { key: 'gallery_help', label: "Aide à la galerie", desc: "Ajoutez des cartes de visite pour aider les visiteurs." },
          { key: 'slideshow', label: "Diaporama", desc: "Permettre aux visiteurs de visualiser en diaporama." }
        ].map((item) => (
          <div key={item.key} className="flex items-start justify-between">
            <div className="flex flex-col gap-1 pr-10">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">{item.label}</label>
              <p className="text-[10px] text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
            <div 
              onClick={() => handleSettingChange(item.key, !settings[item.key as keyof typeof settings])}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300 ${settings[item.key as keyof typeof settings] ? 'bg-orange-600' : 'bg-gray-200 dark:bg-white/10'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${settings[item.key as keyof typeof settings] ? 'right-1' : 'left-1'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Options de partage et langue */}
      <div className="pt-6 space-y-8">
        <div className="flex items-start justify-between">
           <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">Partage social</label>
           <div 
              onClick={() => handleSettingChange('social_sharing', !settings.social_sharing)}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${settings.social_sharing ? 'bg-orange-600' : 'bg-gray-200 dark:bg-white/10'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.social_sharing ? 'right-1' : 'left-1'}`} />
            </div>
        </div>
        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">Langue</label>
          <select 
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="w-full max-w-xs bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
          >
            <option>Français</option>
            <option>Anglais</option>
          </select>
        </div>
      </div>
    </div>
  </div>
)}

{settingsTab === 'privacy' && (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
    <div>
      <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Confidentialité</h2>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-orange-600">Accès et protection</p>
    </div>

    <div className="space-y-10">
      {/* Toggle Protection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between max-w-md">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">Protection par mot de passe</label>
            <p className="text-[9px] text-gray-400 uppercase">Verrouiller l'accès à la galerie</p>
          </div>
          <div 
            onClick={() => handleSettingChange('is_protected', !settings.is_protected)}
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${settings.is_protected ? 'bg-orange-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.is_protected ? 'right-1' : 'left-1'}`} />
          </div>
        </div>
        
        {/* AFFICHAGE CONDITIONNEL DU MOT DE PASSE */}
        {settings.is_protected && (
          <div className="space-y-3 animate-in zoom-in-95 fade-in duration-300">
            <div className="relative max-w-md">
              <input 
                type="text" 
                placeholder="Définir le mot de passe"
                value={settings.password}
                onChange={(e) => handleSettingChange('password', e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-4 text-sm font-mono outline-none focus:text-orange-600 pr-24"
              />
              <button 
                onClick={() => handleSettingChange('password', Math.random().toString(36).slice(-8).toUpperCase())}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-orange-600 hover:text-orange-400"
              >
                Générer
              </button>
            </div>
            <p className="text-[10px] text-orange-600 font-bold italic">
              ⚠️ Notez ce mot de passe, il sera demandé aux visiteurs.
            </p>
          </div>
        )}
      </div>

      {/* Visibilité Index */}
      <div className="space-y-4">
        <div className="flex items-center justify-between max-w-md p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-black uppercase tracking-widest">Afficher sur l'index</span>
            <p className="text-[9px] text-gray-400 uppercase">Visible sur votre page d'accueil</p>
          </div>
          <div 
             onClick={() => handleSettingChange('show_on_homepage', !settings.show_on_homepage)}
             className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${settings.show_on_homepage ? 'bg-orange-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.show_on_homepage ? 'right-1' : 'left-1'}`} />
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{settingsTab === 'download' && (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
    <div>
      <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Téléchargement</h2>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-orange-600">Gestion des fichiers sortants</p>
    </div>

    <div className="space-y-10">
      {/* Toggle Activation Téléchargement */}
      <div className="flex items-center justify-between max-w-md">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">Téléchargement des photos</label>
          <p className="text-[9px] text-gray-400 uppercase">Autoriser les visiteurs à télécharger</p>
        </div>
        <div 
          onClick={() => handleSettingChange('enable_download', !settings.enable_download)}
          className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${settings.enable_download ? 'bg-orange-500' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enable_download ? 'right-1' : 'left-1'}`} />
        </div>
      </div>

      {settings.enable_download && (
        <div className="space-y-10 animate-in fade-in duration-500">
          
          {/* Tailles de téléchargement */}
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">Tailles autorisées</label>
            <div className="grid grid-cols-1 gap-3 max-w-md">
              <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={settings.allow_high_res}
                  onChange={(e) => handleSettingChange('allow_high_res', e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest">Haute Résolution</span>
                  <span className="text-[8px] text-gray-400 uppercase">Fichier original (3600px+)</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={settings.allow_web_size}
                  onChange={(e) => handleSettingChange('allow_web_size', e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest">Format Web</span>
                  <span className="text-[8px] text-gray-400 uppercase">Optimisé pour mobile (1024px)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Code PIN de téléchargement */}
          <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between max-w-md">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">Code PIN requis</label>
                <p className="text-[9px] text-gray-400 uppercase">Sécuriser le téléchargement</p>
              </div>
              <div 
                onClick={() => handleSettingChange('download_pin_enabled', !settings.download_pin_enabled)}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${settings.download_pin_enabled ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.download_pin_enabled ? 'right-1' : 'left-1'}`} />
              </div>
            </div>

            {settings.download_pin_enabled && (
              <div className="relative max-w-[200px] animate-in zoom-in-95 duration-300">
                <input 
                  type="text" 
                  maxLength={4}
                  value={settings.download_pin}
                  onChange={(e) => handleSettingChange('download_pin', e.target.value.replace(/\D/g,''))}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-4 text-2xl font-mono font-black tracking-[0.5em] text-center outline-none focus:border-orange-500"
                />
                <button 
                  onClick={() => handleSettingChange('download_pin', Math.floor(1000 + Math.random() * 9000).toString())}
                  className="mt-2 text-[9px] font-black uppercase text-orange-600 hover:underline w-full text-center"
                >
                  Générer un PIN
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  </div>
)}

{settingsTab === 'favorites' && (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
    <div>
      <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Favoris</h2>
      <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Sélection et choix des clients</p>
    </div>

    <div className="space-y-10">
      {/* Activer les favoris */}
      <div className="flex items-center justify-between max-w-md">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-700">Liste de favoris</label>
          <p className="text-[9px] text-gray-400 uppercase">Permettre aux visiteurs de créer une sélection</p>
        </div>
        <div 
          onClick={() => handleSettingChange('enable_favorites', !settings.enable_favorites)}
          className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${settings.enable_favorites ? 'bg-orange-600' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.enable_favorites ? 'right-1' : 'left-1'}`} />
        </div>
      </div>

      {settings.enable_favorites && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Email requis */}
          <div className="flex items-center justify-between max-w-md p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-black uppercase tracking-widest">Identification par email</span>
              <p className="text-[9px] text-gray-400 uppercase">Requis pour sauvegarder la liste</p>
            </div>
            <div 
               onClick={() => handleSettingChange('require_email_favorites', !settings.require_email_favorites)}
               className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${settings.require_email_favorites ? 'bg-orange-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.require_email_favorites ? 'right-1' : 'left-1'}`} />
            </div>
          </div>

          {/* Notes sur favoris */}
          <div className="flex items-center justify-between max-w-md p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-black uppercase tracking-widest">Notes et commentaires</span>
              <p className="text-[9px] text-gray-400 uppercase">Autoriser les notes sur chaque photo</p>
            </div>
            <div 
               onClick={() => handleSettingChange('allow_favorite_notes', !settings.allow_favorite_notes)}
               className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${settings.allow_favorite_notes ? 'bg-orange-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.allow_favorite_notes ? 'right-1' : 'left-1'}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)}
      </div>

      
    </div>
    {/* BOUTON ENREGISTRER - FIXÉ ET CENTRÉ DANS LA ZONE DE DROITE */}
 <div className="absolute bottom-0 left-0 lg:left-64 right-0 h-32 bg-gradient-to-t from-white dark:from-[#050505] via-white/90 dark:via-[#050505]/90 to-transparent pointer-events-none flex items-center justify-center z-50">
          <button 
            onClick={saveGeneralSettings}
            disabled={uploading}
            className="pointer-events-auto bg-orange-600 dark:bg-white text-white dark:text-black px-16 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 transition-all mb-4 flex items-center gap-3"
          >
            {uploading && <Loader2 size={14} className="animate-spin" />}
            Enregistrer les modifications
          </button>
        </div>

  </div> // FERME LE CONTENEUR FLEX DES SETTINGS
          ) : activeTab === 'share' ? (
  <div className="flex flex-col lg:flex-row h-full animate-in fade-in duration-500 overflow-hidden">
    {/* MENU GAUCHE : CONFIGURATION DES ACTIVITÉS */}
    <div className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-white/5 bg-white dark:bg-[#080808] p-6 lg:p-8 overflow-y-auto shrink-0">
      <div className="mb-10">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Activités & Partage</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Interactions de la galerie</p>
      </div>

      <div className="space-y-8 pb-20">
        
        {/* SECTION : SYSTÈME */}
        <div className="space-y-4">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600 ml-1">Système & Accès</label>
          
          {/* Email Registration */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest">Enregistrement Email</span>
              <p className="text-[8px] text-gray-400 uppercase">Obligatoire pour voir les photos</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.email_registration}
              onChange={(e) => handleSettingChange('email_registration', e.target.checked)}
              className="w-4 h-4 accent-orange-600"
            />
          </div>

          {/* Private Photos */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest">Photos Privées</span>
              <p className="text-[8px] text-gray-400 uppercase">Masquer les photos sensibles</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.is_protected}
              onChange={(e) => handleSettingChange('is_protected', e.target.checked)}
              className="w-4 h-4 accent-orange-600"
            />
          </div>
        </div>

        {/* SECTION : ACTIONS CLIENTS */}
        <div className="space-y-4">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-600 ml-1">Actions autorisées</label>
          
          {/* Download Activity */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg"><Download size={14} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Téléchargements</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.enable_download}
              onChange={(e) => handleSettingChange('enable_download', e.target.checked)}
              className="w-4 h-4 accent-orange-600"
            />
          </div>

          {/* Favorite Activity */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg"><Heart size={14} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Favoris & Sélection</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.enable_favorites}
              onChange={(e) => handleSettingChange('enable_favorites', e.target.checked)}
              className="w-4 h-4 accent-orange-600"
            />
          </div>

          {/* Store Orders */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg"><Plus size={14} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Boutique / Commandes</span>
            </div>
            <input 
              type="checkbox" 
              className="w-4 h-4 accent-orange-600"
            />
          </div>
        </div>

        <button 
          onClick={saveGeneralSettings}
          className="w-full bg-orange-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/20 hover:scale-[1.02] transition-all"
        >
          Enregistrer les activités
        </button>
      </div>
    </div>

    {/* APERÇU DROITE : QUICK SHARE & VISUALISATION */}
    <div className="flex-1 bg-gray-50 dark:bg-[#030303] p-6 lg:p-12 flex flex-col items-center overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* CARD : QUICK SHARE LINKS */}
        <div className="bg-white dark:bg-[#080808] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="mb-6">
            <h3 className="text-sm font-black uppercase italic tracking-widest">Quick Share Links</h3>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest">Partagez rapidement le lien de la galerie</p>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
            <div className="flex-1 px-3 text-[10px] font-mono truncate text-gray-500">
              mboapix.com/gallery/{settings.slug}
            </div>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-700 transition-colors">
              Copier
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <button className="flex flex-col items-center justify-center p-4 bg-green-500/5 hover:bg-green-500/10 border border-green-500/10 rounded-2xl transition-all group">
              <Share2 size={18} className="text-green-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black uppercase text-green-600">WhatsApp</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-blue-600/5 hover:bg-blue-600/10 border border-blue-600/10 rounded-2xl transition-all group">
              <Share size={18} className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black uppercase text-blue-600">Facebook</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-orange-600/5 hover:bg-orange-600/10 border border-orange-600/10 rounded-2xl transition-all group">
              <Plus size={18} className="text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black uppercase text-orange-600">QR Code</span>
            </button>
          </div>
        </div>

        {/* STATS RAPIDES (Simulation d'activité) */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#080808] p-6 rounded-[32px] border border-gray-100 dark:border-white/5">
            <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em]">Vues Totales</span>
            <div className="text-2xl font-black italic text-orange-600 mt-1">1,284</div>
          </div>
          <div className="bg-white dark:bg-[#080808] p-6 rounded-[32px] border border-gray-100 dark:border-white/5">
            <span className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em]">Favoris</span>
            <div className="text-2xl font-black italic text-orange-600 mt-1">42</div>
          </div>
        </div>

      </div>
    </div>
  </div>
):(
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter opacity-20">Contenu {activeTab}</h2>
          </div>
         
         )}
          
        </main>
      </div>

      {isCoverModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsCoverModalOpen(false)} />
          <div className={`relative w-full ${modalStep === 'album' ? 'max-w-6xl h-[85vh]' : 'max-w-2xl h-auto max-h-[90vh]'} bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300`}>
            {modalStep === 'upload' && (
              <div className="flex flex-col h-full">
                <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100 shrink-0">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Modifier la une</h3>
                  <button onClick={() => setIsCoverModalOpen(false)} className="p-2 text-gray-400 hover:text-black transition-all"><X size={22} /></button>
                </div>
                <div className="p-10 overflow-y-auto">
                  <div className="border-2 border-dashed border-gray-200 rounded-[2rem] py-20 flex flex-col items-center justify-center bg-gray-50/30">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-6"><UploadCloud size={28} className="text-orange-600" /></div>
                    <button onClick={(e) => { e.stopPropagation(); setModalStep('album'); }} className="bg-orange-600 text-white px-12 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-600/20 hover:scale-105 transition-transform">Ouvrir l'album</button>
                  </div>
                </div>
              </div>
            )}
            {modalStep === 'album' && (
              <div className="flex flex-col h-full bg-white">
                <div className="px-8 py-4 flex items-center justify-between border-b border-gray-100 bg-white shrink-0">
                  <button onClick={() => setIsCoverModalOpen(false)} className="p-2 text-gray-400 hover:text-black transition-all"><X size={20} /></button>
                  <h3 className="text-sm font-medium text-gray-700">Sélectionnez une Photo</h3>
                  <button onClick={handleConfirmCover} disabled={!tempSelectedCover || updatingCover} className={`px-6 py-2 rounded-[4px] text-[12px] font-bold transition-all ${tempSelectedCover ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-300'}`}>
                    {updatingCover ? <Loader2 size={16} className="animate-spin" /> : 'Sélectionner'}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                    {photos.map((photo) => (
                      <div key={photo.id} onClick={() => setTempSelectedCover(photo.url)} className="group cursor-pointer">
                        <div className={`relative  overflow-hidden transition-all ${tempSelectedCover === photo.url ? 'ring-4 ring-orange-600 ring-offset-4 scale-[1.05]' : 'border border-gray-100'}`}>
                          <img src={photo.url} className="w-full h-full object-cover" alt="Option" />
                          {tempSelectedCover === photo.url && <div className="absolute top-2 right-2 bg-orange-600 text-white p-1 rounded-full"><Check size={14} strokeWidth={4} /></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isToastVisible && (
        <div className="fixed bottom-8 right-8 z-[110] w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-right-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600/10 rounded-lg">
                {uploading ? <Loader2 size={16} className="text-orange-600 animate-spin" /> : <Check size={16} className="text-green-500" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{uploading ? "Envoi en cours..." : "Photos ajoutées !"}</span>
          </div>
        </div>
      )}
    </div>
  )
}