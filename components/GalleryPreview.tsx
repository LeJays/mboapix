export default function GalleryPreview({
  gallery,
  photos,
  theme,
}: any) {
  const { palette, typography, coverStyle, thumbnailSize, gridSpacing } = theme
  const colorConfigs: any = {
  light: {
    bg: "#ffffff",
    text: "#111111",
  },
  dark: {
    bg: "#000000",
    text: "#ffffff",
  },
}

const typographyConfig: any = {
  serif: "font-serif",
  sans: "font-sans",
  mono: "font-mono",
}

const gridConfig: any = {
  columns: {
    small: "grid grid-cols-2",
    medium: "grid grid-cols-3",
    large: "grid grid-cols-4",
    xl: "grid grid-cols-5",
  },
  gap: {
    small: "gap-2",
    medium: "gap-4",
    large: "gap-6",
  },
}

  return (
    <div
      className="w-full min-h-screen transition-all duration-700"
      style={{
        backgroundColor: colorConfigs[palette].bg,
        color: colorConfigs[palette].text,
      }}
    >

      {/* COVER */}
      {coverStyle !== 'None' && (
        <div className={`relative w-full mb-16
          ${['Center','Left','Stripe','Outline','Classic','Love'].includes(coverStyle) ? 'h-[80vh]' : ''}
          ${coverStyle === 'Novel' ? 'h-[70vh] flex flex-row-reverse' : ''}
          ${coverStyle === 'Vintage' ? 'h-[85vh] flex flex-col' : ''}
          ${coverStyle === 'Frame' ? 'h-[80vh] p-10' : ''}
          ${coverStyle === 'Divider' ? 'h-[80vh] flex' : ''}
          ${coverStyle === 'Journal' ? 'h-[80vh] flex p-12 gap-12' : ''}
          ${coverStyle === 'Stamp' ? 'h-[70vh] flex flex-col items-center justify-center' : ''}
        `}>

          <div className={`relative overflow-hidden
            ${['Center','Left','Stripe','Outline','Classic','Love','Stamp'].includes(coverStyle) ? 'w-full h-full' : ''}
            ${coverStyle === 'Novel' ? 'w-1/2 h-full' : ''}
            ${coverStyle === 'Vintage' ? 'w-full h-3/4' : ''}
            ${coverStyle === 'Frame' ? 'w-full h-full shadow-2xl' : ''}
            ${coverStyle === 'Divider' ? 'w-1/2 h-full' : ''}
            ${coverStyle === 'Journal' ? 'w-2/3 h-full' : ''}
          `}>
            
            {gallery?.cover_url && (
              <img src={gallery.cover_url} className="w-full h-full object-cover" />
            )}

            <div className={`absolute inset-0 flex items-center p-12
              ${coverStyle === 'Center' ? 'justify-center text-center bg-black/20' : ''}
              ${coverStyle === 'Left' ? 'justify-start text-left bg-black/10' : ''}
              ${coverStyle === 'Stripe' ? 'justify-center text-center border-y-4 border-white/30 m-20 bg-black/20' : ''}
              ${coverStyle === 'Outline' ? 'justify-center text-center' : ''}
              ${coverStyle === 'Love' ? 'justify-center text-center bg-white/10 backdrop-blur-[2px]' : ''}
            `}>

              {['Center','Left','Stripe','Outline','Classic','Frame'].includes(coverStyle) && (
                <div className={coverStyle === 'Outline' ? 'border-2 border-white p-10' : ''}>
                  <h4 className={`text-white uppercase ${typographyConfig[typography]} ${coverStyle === 'Outline' ? 'text-5xl' : 'text-6xl'}`}>
                    {gallery?.event_name}
                  </h4>
                </div>
              )}

              {coverStyle === 'Love' && (
                <h4 className={`text-white text-[12vw] uppercase ${typographyConfig[typography]}`}>
                  LOVE
                </h4>
              )}
            </div>
          </div>

          {['Novel','Vintage','Divider','Journal','Stamp'].includes(coverStyle) && (
            <div className="flex flex-col items-center justify-center p-10">
              <h4 className={`uppercase ${typographyConfig[typography]} text-5xl`}>
                {gallery?.event_name}
              </h4>
            </div>
          )}
        </div>
      )}

      {/* NAV */}
      <div className="flex justify-between px-8 py-4 border-b">
        <h3>{gallery?.event_name}</h3>
      </div>

      {/* GRID */}
      <div className={`${gridConfig.columns[thumbnailSize]} ${gridConfig.gap[gridSpacing]}`}>
        {photos.map((p: any, i: number) => (
          <img key={i} src={p.url} className="w-full" />
        ))}
      </div>

    </div>
  )
}