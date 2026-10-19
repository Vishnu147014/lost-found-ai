import React, { useState } from 'react'
import { 
  MapPin, 
  Layers, 
  Truck, 
  Search, 
  Gift, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  Crosshair,
  ExternalLink,
  Info,
  Compass,
  Plus,
  Minus
} from 'lucide-react'
import { Coordinates, DeliveryJob, Item } from '../types'

interface InteractiveMapProps {
  items: Item[]
  deliveries: DeliveryJob[]
  onSelectItem: (item: Item) => void
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  items,
  deliveries,
  onSelectItem
}) => {
  const [filter, setFilter] = useState<'all' | 'lost' | 'found' | 'deliveries'>('all')
  const [mapType, setMapType] = useState<'map' | 'satellite'>('map')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPin, setSelectedPin] = useState<{
    type: 'lost' | 'found' | 'courier'
    item?: Item
    delivery?: DeliveryJob
  } | null>(null)
  const [zoom, setZoom] = useState(1)

  // Map viewport bounds (centered roughly around NYC/Metro area)
  // Convert GPS coordinates to SVG canvas position (x, y % within 0-100)
  const coordsToPos = (coords: Coordinates) => {
    const latSpan = 0.12
    const lngSpan = 0.08

    const y = ((40.82 - coords.lat) / latSpan) * 100
    const x = ((coords.lng - (-74.02)) / lngSpan) * 100

    return {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y))
    }
  }

  const filteredLost = items.filter(i => i.type === 'lost')
  const filteredFound = items.filter(i => i.type === 'found')
  const activeDeliveries = deliveries.filter(d => d.status === 'in_transit' || d.status === 'assigned')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
              <Navigation className="w-5 h-5 text-blue-600" />
            </div>
            <span>Live Geospatial Lost & Found Radar</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time visual Google Map coordinates of lost gadgets, found items, and active courier transit routes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Pins ({items.length + activeDeliveries.length})
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filter === 'lost' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Lost ({filteredLost.length})</span>
          </button>
          <button
            onClick={() => setFilter('found')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filter === 'found' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Found ({filteredFound.length})</span>
          </button>
          <button
            onClick={() => setFilter('deliveries')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filter === 'deliveries' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Couriers ({activeDeliveries.length})</span>
          </button>
        </div>
      </div>

      {/* Main Authentic Google Maps Radar Surface */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-300 shadow-lg bg-[#f4f3f0] h-[580px] select-none">
        
        {/* Animated Map Surface */}
        <div 
          className="absolute inset-0 transition-transform duration-300"
          style={{
            transform: `scale(${zoom})`,
            backgroundColor: mapType === 'satellite' ? '#1e293b' : '#f4f3f0'
          }}
        >
          {/* Authentic Google Maps Vector Base */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none">
            {mapType !== 'satellite' ? (
              <>
                {/* Water Bodies (Hudson & East River in authentic Google Maps blue) */}
                <path d="M 0,0 L 160,0 L 110,600 L 0,600 Z" fill="#aad3df" />
                <path d="M 520,0 L 600,0 L 600,600 L 460,600 Z" fill="#aad3df" />
                
                {/* Parks & Green Reserves (Central Park) */}
                <rect x="220" y="70" width="160" height="230" rx="8" fill="#cbe6a3" />
                <text x="250" y="180" fill="#608040" fontSize="12" fontWeight="600" opacity="0.8">Central Park</text>

                {/* Additional green parks */}
                <rect x="230" y="360" width="60" height="40" rx="4" fill="#cbe6a3" />
                <text x="235" y="385" fill="#608040" fontSize="9" fontWeight="600" opacity="0.7">Bryant Park</text>
                
                <rect x="180" y="470" width="70" height="45" rx="4" fill="#cbe6a3" />
                <text x="185" y="495" fill="#608040" fontSize="9" fontWeight="600" opacity="0.7">Union Sq</text>

                {/* Major Arterial Highways (Yellow/Orange Google highways) */}
                <path d="M 160,0 L 110,600" stroke="#fbd786" strokeWidth="8" strokeLinecap="round" />
                <path d="M 160,0 L 110,600" stroke="#f6a623" strokeWidth="6" strokeLinecap="round" />
                
                <path d="M 520,0 L 460,600" stroke="#fbd786" strokeWidth="8" strokeLinecap="round" />
                <path d="M 520,0 L 460,600" stroke="#f6a623" strokeWidth="6" strokeLinecap="round" />

                {/* Broadway Diagonals */}
                <path d="M 380,0 L 220,600" stroke="#ffffff" strokeWidth="7" />
                <path d="M 380,0 L 220,600" stroke="#fbd786" strokeWidth="4" />

                {/* Avenues (Vertical white grid with subtle border) */}
                <line x1="180" y1="0" x2="180" y2="600" stroke="#ffffff" strokeWidth="6" />
                <line x1="220" y1="0" x2="220" y2="600" stroke="#ffffff" strokeWidth="6" />
                <line x1="260" y1="0" x2="260" y2="600" stroke="#ffffff" strokeWidth="6" />
                <line x1="300" y1="0" x2="300" y2="600" stroke="#ffffff" strokeWidth="6" />
                <line x1="340" y1="0" x2="340" y2="600" stroke="#ffffff" strokeWidth="6" />
                <line x1="380" y1="0" x2="380" y2="600" stroke="#ffffff" strokeWidth="6" />
                <line x1="420" y1="0" x2="420" y2="600" stroke="#ffffff" strokeWidth="6" />
                <line x1="460" y1="0" x2="460" y2="600" stroke="#ffffff" strokeWidth="6" />

                {/* Streets (Horizontal cross streets) */}
                {[50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550].map((yVal, i) => (
                  <line key={i} x1="110" y1={yVal} x2="520" y2={yVal} stroke="#ffffff" strokeWidth="3.5" />
                ))}

                {/* Street Names / Landmarks */}
                <text x="240" y="45" fill="#70757a" fontSize="10" fontWeight="500">W 86th St</text>
                <text x="240" y="325" fill="#70757a" fontSize="10" fontWeight="500">W 59th St / Columbus Circle</text>
                <text x="240" y="425" fill="#70757a" fontSize="10" fontWeight="500">W 42nd St / Times Sq</text>
                <text x="240" y="525" fill="#70757a" fontSize="10" fontWeight="500">W 14th St</text>
              </>
            ) : (
              /* Satellite mode grid */
              <>
                <rect x="0" y="0" width="100%" height="100%" fill="#1a202c" />
                <line x1="0" y1="300" x2="600" y2="300" stroke="#4a5568" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="300" y1="0" x2="300" y2="600" stroke="#4a5568" strokeWidth="2" strokeDasharray="4 4" />
              </>
            )}
          </svg>

          {/* Connect courier routes with authentic Google Maps blue polyline */}
          {(filter === 'all' || filter === 'deliveries') && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {activeDeliveries.map(d => {
                const p1 = coordsToPos(d.pickupCoords)
                const p2 = coordsToPos(d.deliveryCoords)
                return (
                  <g key={d.id}>
                    {/* Shadow for Google route */}
                    <line 
                      x1={`${p1.x}%`} 
                      y1={`${p1.y}%`} 
                      x2={`${p2.x}%`} 
                      y2={`${p2.y}%`} 
                      stroke="#174ea6" 
                      strokeWidth="7" 
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                    {/* Google Blue Navigation line */}
                    <line 
                      x1={`${p1.x}%`} 
                      y1={`${p1.y}%`} 
                      x2={`${p2.x}%`} 
                      y2={`${p2.y}%`} 
                      stroke="#1a73e8" 
                      strokeWidth="5" 
                      strokeLinecap="round"
                    />
                    {/* Directional chevrons / dots */}
                    <line 
                      x1={`${p1.x}%`} 
                      y1={`${p1.y}%`} 
                      x2={`${p2.x}%`} 
                      y2={`${p2.y}%`} 
                      stroke="#ffffff" 
                      strokeWidth="1.5" 
                      strokeDasharray="6 8"
                      className="animate-pulse"
                    />
                  </g>
                )
              })}
            </svg>
          )}

          {/* Lost Item Pins (Authentic Google Red Teardrop Marker) */}
          {(filter === 'all' || filter === 'lost') && filteredLost.map(item => {
            const pos = coordsToPos(item.coordinates)
            return (
              <div
                key={item.id}
                onClick={() => setSelectedPin({ type: 'lost', item })}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group z-20 transition-transform duration-150 hover:scale-125"
              >
                <div className="relative flex flex-col items-center">
                  {/* Google Red Pin */}
                  <svg width="34" height="44" viewBox="0 0 24 32" className="drop-shadow-md">
                    <path
                      d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z"
                      fill="#ea4335"
                    />
                    <circle cx="12" cy="11" r="5" fill="#b31412" />
                    <circle cx="12" cy="11" r="2.5" fill="#ffffff" />
                  </svg>
                  
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-bold shadow-xl whitespace-nowrap hidden group-hover:block z-30">
                    <span className="text-rose-600 font-extrabold mr-1">Lost:</span>
                    {item.title}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Found Item Pins (Authentic Google Green Teardrop Marker) */}
          {(filter === 'all' || filter === 'found') && filteredFound.map(item => {
            const pos = coordsToPos(item.coordinates)
            return (
              <div
                key={item.id}
                onClick={() => setSelectedPin({ type: 'found', item })}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group z-20 transition-transform duration-150 hover:scale-125"
              >
                <div className="relative flex flex-col items-center">
                  {/* Google Green Pin */}
                  <svg width="34" height="44" viewBox="0 0 24 32" className="drop-shadow-md">
                    <path
                      d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z"
                      fill="#34a853"
                    />
                    <circle cx="12" cy="11" r="5" fill="#188038" />
                    <circle cx="12" cy="11" r="2.5" fill="#ffffff" />
                  </svg>

                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-bold shadow-xl whitespace-nowrap hidden group-hover:block z-30">
                    <span className="text-emerald-600 font-extrabold mr-1">Found:</span>
                    {item.title}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Courier Pins (Google Blue Courier Beacon) */}
          {(filter === 'all' || filter === 'deliveries') && activeDeliveries.map(d => {
            const p1 = coordsToPos(d.pickupCoords)
            const p2 = coordsToPos(d.deliveryCoords)
            const midX = (p1.x + p2.x) / 2
            const midY = (p1.y + p2.y) / 2

            return (
              <div
                key={d.id}
                onClick={() => setSelectedPin({ type: 'courier', delivery: d })}
                style={{ left: `${midX}%`, top: `${midY}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30"
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-10 h-10 rounded-2xl bg-[#1a73e8] text-white flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-blue-700 shadow-md whitespace-nowrap">
                    Courier En Route ({d.distanceKm} km)
                  </div>
                </div>
              </div>
            )
          })}

        </div>

        {/* Top Google Maps Search Bar Overlay */}
        <div className="absolute top-4 left-4 z-30 max-w-sm w-full">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 flex items-center px-3.5 py-2.5 gap-2.5">
            <Search className="w-4 h-4 text-[#70757a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Google Maps"
              className="w-full text-xs text-slate-800 focus:outline-none placeholder-slate-400 bg-transparent font-sans"
            />
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
              <Compass className="w-4 h-4 text-[#1a73e8] cursor-pointer hover:rotate-45 transition-transform" />
            </div>
          </div>
        </div>

        {/* Map / Satellite Toggle Top Right */}
        <div className="absolute top-4 right-4 z-30 flex rounded-lg shadow-md overflow-hidden border border-slate-200 bg-white text-xs font-semibold">
          <button
            onClick={() => setMapType('map')}
            className={`px-3 py-1.5 transition-colors ${
              mapType === 'map' ? 'bg-[#1a73e8] text-white' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1.5 transition-colors border-l border-slate-200 ${
              mapType === 'satellite' ? 'bg-[#1a73e8] text-white' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Google Maps Legend (Clean White Floating Box) */}
        <div className="absolute bottom-10 left-4 p-3 rounded-2xl bg-white/95 backdrop-blur-xs border border-slate-200 text-xs space-y-2 pointer-events-auto shadow-md">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Radar Legend</div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-[#ea4335] shrink-0 border border-red-300" />
            <span>Lost Item Marker</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-[#34a853] shrink-0 border border-emerald-300" />
            <span>Found Item (Good Samaritan)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-3 h-3 rounded-xl bg-[#1a73e8] shrink-0" />
            <span>Courier Transit Route</span>
          </div>
        </div>

        {/* Authentic Google Maps Zoom & Control Stack (Bottom Right) */}
        <div className="absolute bottom-8 right-4 flex flex-col gap-2 pointer-events-auto z-30">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden flex flex-col">
            <button
              onClick={() => setZoom(prev => Math.min(2.0, prev + 0.2))}
              title="Zoom in"
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-200"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.8, prev - 0.2))}
              title="Zoom out"
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setZoom(1.0)}
            title="Recenter view"
            className="w-8 h-8 rounded-lg bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Crosshair className="w-4 h-4 text-[#1a73e8]" />
          </button>
        </div>

        {/* Google Watermark in Bottom Left */}
        <div className="absolute bottom-1 left-2 flex items-center gap-2 pointer-events-none select-none text-[10px] text-[#5f6368] font-sans">
          <span className="font-bold tracking-tight text-slate-700">Google</span>
          <span className="text-[9px] opacity-70">Map data ©2026 • Terms of Use</span>
        </div>

        {/* Selected Pin Popup Drawer */}
        {selectedPin && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-4 max-w-sm w-[92%] sm:w-full bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl z-40 animate-fade-in text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                selectedPin.type === 'lost' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                selectedPin.type === 'found' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {selectedPin.type === 'courier' ? 'Courier Delivery' : `${selectedPin.type} Item`}
              </span>
              <button
                onClick={() => setSelectedPin(null)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {selectedPin.item && (
              <div className="mt-3 space-y-3">
                <div className="flex gap-3">
                  <img 
                    src={selectedPin.item.photos[0]} 
                    alt={selectedPin.item.title} 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{selectedPin.item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{selectedPin.item.description}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="truncate">{selectedPin.item.locationAddress}</span>
                </div>

                <button
                  onClick={() => onSelectItem(selectedPin.item!)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Inspect in Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {selectedPin.delivery && (
              <div className="mt-3 space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Order #{selectedPin.delivery.id.slice(-6)}</span>
                  <span className="text-blue-600 font-mono font-bold">${selectedPin.delivery.courierPayout.toFixed(2)} Payout</span>
                </div>
                <div className="text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
                  <div><strong>From:</strong> {selectedPin.delivery.pickupAddress}</div>
                  <div className="mt-1"><strong>To:</strong> {selectedPin.delivery.deliveryAddress}</div>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                  Courier: {selectedPin.delivery.courierName || 'Marco Silva'} (Motorcycle)
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  )
}
