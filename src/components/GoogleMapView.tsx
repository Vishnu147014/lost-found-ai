import React, { useState } from 'react'
import { 
  Navigation, 
  Search, 
  Layers, 
  Compass, 
  Plus, 
  Minus, 
  Crosshair, 
  MapPin, 
  Truck, 
  Maximize2,
  Share2
} from 'lucide-react'
import { Coordinates, DeliveryJob, Item } from '../types'

interface GoogleMapViewProps {
  items?: Item[]
  deliveries?: DeliveryJob[]
  center?: Coordinates
  zoom?: number
  height?: string
  showSearch?: boolean
  showControls?: boolean
  interactive?: boolean
  route?: {
    pickup: { name: string; coords: Coordinates }
    delivery: { name: string; coords: Coordinates }
    courier?: { name: string; coords: Coordinates }
    distanceKm?: number
    etaMinutes?: number
  }
  onPinClick?: (item: Item) => void
  onMapClick?: (coords: Coordinates) => void
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  items = [],
  deliveries = [],
  center = { lat: 40.7580, lng: -73.9855 },
  height = '420px',
  showSearch = true,
  showControls = true,
  interactive = true,
  route,
  onPinClick,
  onMapClick
}) => {
  const [mapType, setMapType] = useState<'map' | 'satellite' | 'terrain'>('map')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [trafficActive, setTrafficActive] = useState(true)

  // Convert coords to relative percentage position on canvas
  const coordsToPos = (coords: Coordinates) => {
    const latSpan = 0.12
    const lngSpan = 0.08
    const y = ((40.82 - coords.lat) / latSpan) * 100
    const x = ((coords.lng - (-74.02)) / lngSpan) * 100
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(8, Math.min(92, y))
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMapClick) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const newLat = Math.round((40.82 - y * 0.12) * 10000) / 10000
    const newLng = Math.round((-74.02 + x * 0.08) * 10000) / 10000
    onMapClick({ lat: newLat, lng: newLng })
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-300/80 shadow-md bg-[#f4f3f0] select-none" style={{ height }}>
      
      {/* Google Maps Base Vector Surface */}
      <div 
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full transition-transform duration-200"
        style={{
          transform: `scale(${zoomLevel})`,
          backgroundColor: mapType === 'satellite' ? '#1e293b' : '#f4f3f0'
        }}
      >
        {/* Real Google Maps Vector Street Geometry */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none">
          {mapType !== 'satellite' ? (
            <>
              {/* Water Bodies (Hudson & East River in authentic Google Maps blue) */}
              <path d="M 0,0 L 140,0 L 90,600 L 0,600 Z" fill="#aad3df" />
              <path d="M 520,0 L 600,0 L 600,600 L 460,600 Z" fill="#aad3df" />
              
              {/* Parks & Green Reserves (Central Park in authentic Google green) */}
              <rect x="220" y="80" width="160" height="220" rx="8" fill="#cbe6a3" />
              <text x="245" y="190" fill="#608040" fontSize="12" fontWeight="600" opacity="0.8">Central Park</text>

              {/* Bryant park green block */}
              <rect x="250" y="380" width="70" height="40" rx="4" fill="#cbe6a3" />
              <text x="256" y="405" fill="#608040" fontSize="10" fontWeight="600" opacity="0.8">Bryant Park</text>

              {/* Local Streets Grid (Google Maps subtle gray lines) */}
              {Array.from({ length: 24 }).map((_, i) => (
                <line 
                  key={`h-${i}`} 
                  x1="120" 
                  y1={i * 28} 
                  x2="500" 
                  y2={i * 28} 
                  stroke="#ffffff" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                />
              ))}
              {Array.from({ length: 12 }).map((_, i) => (
                <line 
                  key={`v-${i}`} 
                  x1={140 + i * 32} 
                  y1="0" 
                  x2={140 + i * 32} 
                  y2="600" 
                  stroke="#ffffff" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                />
              ))}

              {/* Major Google Arterial Highways (Yellow/Orange with border) */}
              <line x1="80" y1="40" x2="480" y2="560" stroke="#fbd786" strokeWidth="8" />
              <line x1="80" y1="40" x2="480" y2="560" stroke="#f5af42" strokeWidth="10" strokeDasharray="1000" opacity="0.4" />

              <line x1="140" y1="320" x2="480" y2="320" stroke="#fbd786" strokeWidth="7" />
              <line x1="280" y1="0" x2="280" y2="600" stroke="#fbd786" strokeWidth="7" />

              {/* Street Names (Google Maps style gray typography) */}
              <text x="160" y="315" fill="#78746d" fontSize="9" fontWeight="600">59th St / Central Park S</text>
              <text x="160" y="460" fill="#78746d" fontSize="9" fontWeight="600">34th St / Herald Square</text>
              <text x="360" y="340" fill="#78746d" fontSize="9" fontWeight="600" transform="rotate(45, 360, 340)">Broadway Ave</text>
              <text x="285" y="140" fill="#78746d" fontSize="9" fontWeight="600">5th Ave</text>

              {/* Traffic Flow Overlay (Green/Yellow/Red lines) */}
              {trafficActive && (
                <>
                  <line x1="180" y1="28" x2="420" y2="28" stroke="#00e676" strokeWidth="3" opacity="0.8" />
                  <line x1="280" y1="200" x2="280" y2="380" stroke="#00e676" strokeWidth="3" opacity="0.8" />
                  <line x1="140" y1="320" x2="280" y2="320" stroke="#ff9100" strokeWidth="3.5" opacity="0.85" />
                  <line x1="220" y1="400" x2="340" y2="400" stroke="#ff3d00" strokeWidth="3.5" opacity="0.85" />
                </>
              )}
            </>
          ) : (
            <>
              {/* Satellite Darker Imagery Representation */}
              <rect x="0" y="0" width="100%" height="100%" fill="#1e293b" />
              <rect x="220" y="80" width="160" height="220" rx="8" fill="#14532d" opacity="0.8" />
              <line x1="80" y1="40" x2="480" y2="560" stroke="#cbd5e1" strokeWidth="3" opacity="0.6" />
              <line x1="140" y1="320" x2="480" y2="320" stroke="#cbd5e1" strokeWidth="3" opacity="0.6" />
            </>
          )}

          {/* Active Navigation Polyline (Google Maps Solid Blue Navigation Line) */}
          {route && (
            <g>
              {/* Outer Blue Casing */}
              <line 
                x1={`${coordsToPos(route.pickup.coords).x}%`} 
                y1={`${coordsToPos(route.pickup.coords).y}%`} 
                x2={`${coordsToPos(route.delivery.coords).x}%`} 
                y2={`${coordsToPos(route.delivery.coords).y}%`} 
                stroke="#1a73e8" 
                strokeWidth="7" 
                strokeLinecap="round" 
              />
              {/* Inner Lighter Blue */}
              <line 
                x1={`${coordsToPos(route.pickup.coords).x}%`} 
                y1={`${coordsToPos(route.pickup.coords).y}%`} 
                x2={`${coordsToPos(route.delivery.coords).x}%`} 
                y2={`${coordsToPos(route.delivery.coords).y}%`} 
                stroke="#4285f4" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeDasharray="8 6" 
                className="animate-pulse" 
              />
            </g>
          )}
        </svg>

        {/* Route Pins & Google Maps Style Markers */}
        {route && (
          <>
            {/* Pickup Marker (Green Google Pin A) */}
            <div 
              style={{ 
                left: `${coordsToPos(route.pickup.coords).x}%`, 
                top: `${coordsToPos(route.pickup.coords).y}%` 
              }} 
              className="absolute -translate-x-1/2 -translate-y-full z-20"
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-8 h-10 bg-[#34a853] rounded-t-full rounded-b-none flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-black/30 border-2 border-white" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)' }}>
                    <span className="-mt-2 font-bold">A</span>
                  </div>
                  <div className="w-3 h-1 bg-black/40 rounded-full mx-auto blur-[1px]" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-md bg-white text-[#1e4620] font-bold text-[10px] shadow border border-slate-200 whitespace-nowrap">
                  Pickup: {route.pickup.name}
                </span>
              </div>
            </div>

            {/* Courier Moving Marker (Google Live Location Blue Pulsing Circle / Vehicle) */}
            <div 
              style={{ 
                left: `${(coordsToPos(route.pickup.coords).x + coordsToPos(route.delivery.coords).x) / 2}%`, 
                top: `${(coordsToPos(route.pickup.coords).y + coordsToPos(route.delivery.coords).y) / 2}%` 
              }} 
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
            >
              <div className="relative flex flex-col items-center">
                {/* Google pulsing radar ring */}
                <div className="absolute w-12 h-12 rounded-full bg-[#4285f4]/30 animate-ping pointer-events-none" />
                <div className="w-8 h-8 rounded-full bg-[#1a73e8] border-2 border-white shadow-xl flex items-center justify-center text-white">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-full bg-[#1a73e8] text-white text-[10px] font-bold shadow-md whitespace-nowrap">
                  Courier En Route ({route.distanceKm || 2.4} km)
                </div>
              </div>
            </div>

            {/* Dropoff Marker (Red Google Pin B) */}
            <div 
              style={{ 
                left: `${coordsToPos(route.delivery.coords).x}%`, 
                top: `${coordsToPos(route.delivery.coords).y}%` 
              }} 
              className="absolute -translate-x-1/2 -translate-y-full z-20"
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-8 h-10 bg-[#ea4335] rounded-t-full rounded-b-none flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-black/30 border-2 border-white" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)' }}>
                    <span className="-mt-2 font-bold">B</span>
                  </div>
                  <div className="w-3 h-1 bg-black/40 rounded-full mx-auto blur-[1px]" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-md bg-white text-[#5c1d18] font-bold text-[10px] shadow border border-slate-200 whitespace-nowrap">
                  Dropoff: {route.delivery.name}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Regular Item Pins (Lost: Google Red, Found: Google Green) */}
        {!route && items.map(item => {
          const pos = coordsToPos(item.coordinates)
          const isLost = item.type === 'lost'
          return (
            <div
              key={item.id}
              onClick={() => onPinClick && onPinClick(item)}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-20 group"
            >
              <div className="flex flex-col items-center">
                <div className="relative group-hover:scale-125 transition-transform">
                  <div 
                    className={`w-7 h-9 rounded-t-full rounded-b-none flex items-center justify-center text-white text-[10px] shadow-md border border-white ${
                      isLost ? 'bg-[#ea4335]' : 'bg-[#34a853]'
                    }`}
                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)' }}
                  >
                    <span className="-mt-2 font-bold">{isLost ? 'L' : 'F'}</span>
                  </div>
                  <div className="w-2.5 h-1 bg-black/40 rounded-full mx-auto blur-[1px]" />
                </div>
                <span className="mt-0.5 px-1.5 py-0.5 rounded bg-white/95 text-slate-800 text-[9px] font-bold shadow border border-slate-200 whitespace-nowrap hidden group-hover:block">
                  {item.title}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* TOP-LEFT: Google Maps Search Box */}
      {showSearch && (
        <div className="absolute top-3 left-3 z-30 flex items-center shadow-lg rounded-lg bg-white border border-slate-200/90 overflow-hidden max-w-xs w-full">
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-4 h-4 text-blue-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Google Maps..."
            className="w-full py-2 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          <div className="pr-2 flex items-center gap-1">
            <button 
              type="button" 
              title="Directions"
              className="p-1 rounded text-blue-600 hover:bg-blue-50"
            >
              <Navigation className="w-3.5 h-3.5 fill-blue-600" />
            </button>
          </div>
        </div>
      )}

      {/* TOP-RIGHT: Map / Satellite & Traffic Toggles (Google Style) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-0.5 flex text-[11px] font-semibold text-slate-700">
          <button
            type="button"
            onClick={() => setMapType('map')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mapType === 'map' ? 'bg-slate-100 text-blue-600 font-bold' : 'hover:bg-slate-50'
            }`}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mapType === 'satellite' ? 'bg-slate-100 text-blue-600 font-bold' : 'hover:bg-slate-50'
            }`}
          >
            Satellite
          </button>
        </div>

        <button
          type="button"
          onClick={() => setTrafficActive(!trafficActive)}
          title="Toggle Traffic Layer"
          className={`w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-md flex items-center justify-center text-xs transition-colors ${
            trafficActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM-RIGHT: Google Maps Zoom & Navigation Controls */}
      {showControls && (
        <div className="absolute bottom-4 right-3 z-30 flex flex-col items-center gap-2">
          {/* Compass / Recenter */}
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            title="Recenter Map"
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-50"
          >
            <Compass className="w-4 h-4 text-red-500" />
          </button>

          {/* Zoom controls stack */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden flex flex-col">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.2))}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-50 border-b border-slate-200"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-50"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Pegman Street View Icon (Authentic Google yellow figure) */}
          <button
            type="button"
            title="Street View Pegman"
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-md flex items-center justify-center text-amber-500 hover:bg-amber-50"
          >
            <span className="text-base select-none">🚶</span>
          </button>
        </div>
      )}

      {/* BOTTOM-LEFT: Authentic Google Maps Logo & Scale */}
      <div className="absolute bottom-1.5 left-2 z-30 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-0.5 text-xs font-bold font-sans drop-shadow">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </div>
        <span className="text-[10px] text-slate-500 bg-white/70 px-1 rounded">
          Map data ©2026 Google
        </span>
      </div>

    </div>
  )
}
