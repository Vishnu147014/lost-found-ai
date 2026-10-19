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
  Info
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
  const [selectedPin, setSelectedPin] = useState<{
    type: 'lost' | 'found' | 'courier'
    item?: Item
    delivery?: DeliveryJob
  } | null>(null)
  const [zoom, setZoom] = useState(1)

  // Map viewport bounds (centered roughly around NYC/Metro area)
  const centerLat = 40.7580
  const centerLng = -73.9855

  // Convert GPS coordinates to SVG canvas position (x, y % within 0-100)
  const coordsToPos = (coords: Coordinates) => {
    // Approx bounding box around Manhattan/NYC:
    // Lat: 40.70 to 40.82
    // Lng: -74.02 to -73.94
    const latSpan = 0.12
    const lngSpan = 0.08

    const y = ((40.82 - coords.lat) / latSpan) * 100
    const x = ((coords.lng - (-74.02)) / lngSpan) * 100

    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(8, Math.min(92, y))
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Navigation className="w-6 h-6 text-indigo-400" />
            <span>Live Geospatial Lost & Found Radar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual map coordinates of lost gadgets, found items, and active courier transit routes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Pins ({items.length + activeDeliveries.length})
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
              filter === 'lost' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>Lost ({filteredLost.length})</span>
          </button>
          <button
            onClick={() => setFilter('found')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
              filter === 'found' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Found ({filteredFound.length})</span>
          </button>
          <button
            onClick={() => setFilter('deliveries')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
              filter === 'deliveries' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Couriers ({activeDeliveries.length})</span>
          </button>
        </div>
      </div>

      {/* Main Radar Surface */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl h-[560px] select-none">
        
        {/* Animated Map Grid Background */}
        <div 
          className="absolute inset-0 transition-transform duration-300"
          style={{
            transform: `scale(${zoom})`,
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 80%),
              linear-gradient(to right, #172033 1px, transparent 1px),
              linear-gradient(to bottom, #172033 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px'
          }}
        >
          {/* Street grid stylized paths */}
          <svg className="w-full h-full opacity-20 pointer-events-none">
            <line x1="20%" y1="0%" x2="80%" y2="100%" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5 5" />
            <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="40%" y1="10%" x2="40%" y2="90%" stroke="#4f46e5" strokeWidth="2" />
            <line x1="65%" y1="10%" x2="65%" y2="90%" stroke="#4f46e5" strokeWidth="1.5" />
            <circle cx="50%" cy="50%" r="200" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="8 8" opacity="0.4" />
          </svg>

          {/* Connect courier routes with animated vectors */}
          {(filter === 'all' || filter === 'deliveries') && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {activeDeliveries.map(d => {
                const p1 = coordsToPos(d.pickupCoords)
                const p2 = coordsToPos(d.deliveryCoords)
                return (
                  <g key={d.id}>
                    <line 
                      x1={`${p1.x}%`} 
                      y1={`${p1.y}%`} 
                      x2={`${p2.x}%`} 
                      y2={`${p2.y}%`} 
                      stroke="#06b6d4" 
                      strokeWidth="2.5" 
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                  </g>
                )
              })}
            </svg>
          )}

          {/* Lost Item Pins (Red) */}
          {(filter === 'all' || filter === 'lost') && filteredLost.map(item => {
            const pos = coordsToPos(item.coordinates)
            return (
              <div
                key={item.id}
                onClick={() => setSelectedPin({ type: 'lost', item })}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-900/60 group-hover:scale-125 transition-transform border-2 border-slate-900">
                    <Search className="w-4 h-4" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-red-500/40 text-[10px] font-bold text-red-300 shadow whitespace-nowrap hidden group-hover:block">
                    Lost: {item.title.slice(0, 15)}...
                  </span>
                </div>
              </div>
            )
          })}

          {/* Found Item Pins (Green) */}
          {(filter === 'all' || filter === 'found') && filteredFound.map(item => {
            const pos = coordsToPos(item.coordinates)
            return (
              <div
                key={item.id}
                onClick={() => setSelectedPin({ type: 'found', item })}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/60 group-hover:scale-125 transition-transform border-2 border-slate-900">
                    <Gift className="w-4 h-4" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 shadow whitespace-nowrap hidden group-hover:block">
                    Found: {item.title.slice(0, 15)}...
                  </span>
                </div>
              </div>
            )
          })}

          {/* Courier Pins (Cyan) */}
          {(filter === 'all' || filter === 'deliveries') && activeDeliveries.map(d => {
            const pos = coordsToPos(d.pickupCoords)
            return (
              <div
                key={d.id}
                onClick={() => setSelectedPin({ type: 'courier', delivery: d })}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30"
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-9 h-9 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-xl shadow-cyan-900/70 border-2 border-white animate-bounce">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 shadow whitespace-nowrap">
                    Courier En Route ({d.distanceKm} km)
                  </span>
                </div>
              </div>
            )
          })}

        </div>

        {/* Map Legend Overlay */}
        <div className="absolute top-4 left-4 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs space-y-2 pointer-events-auto shadow-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Radar Legend</div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
            <span>Lost Gadget / Report</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
            <span>Found Item (Good Samaritan)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-2xl bg-cyan-600 shrink-0" />
            <span>Courier Delivery In Transit</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={() => setZoom(prev => Math.min(2.0, prev + 0.2))}
            className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shadow-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.8, prev - 0.2))}
            className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shadow-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1.0)}
            className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center shadow-lg transition-colors"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Pin Popup Drawer */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-3xl p-5 shadow-2xl z-40 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                selectedPin.type === 'lost' ? 'bg-red-950 text-red-300 border border-red-800' :
                selectedPin.type === 'found' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                {selectedPin.type === 'courier' ? 'Courier Delivery' : `${selectedPin.type} Item`}
              </span>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
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
                    className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{selectedPin.item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{selectedPin.item.description}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{selectedPin.item.locationAddress}</span>
                </div>

                <button
                  onClick={() => onSelectItem(selectedPin.item!)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Inspect in Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {selectedPin.delivery && (
              <div className="mt-3 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Order #{selectedPin.delivery.id.slice(-6)}</span>
                  <span className="text-cyan-400 font-mono">${selectedPin.delivery.courierPayout.toFixed(2)}</span>
                </div>
                <div className="text-slate-400">
                  From: {selectedPin.delivery.pickupAddress}
                </div>
                <div className="text-slate-400">
                  To: {selectedPin.delivery.deliveryAddress}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold pt-1">
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
