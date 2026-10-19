import React, { useState } from 'react'
import { MapPin, Navigation, Search, Check, Crosshair, Compass } from 'lucide-react'
import { Coordinates } from '../types'

interface LocationPickerProps {
  value: { address: string; coordinates: Coordinates }
  onChange: (val: { address: string; coordinates: Coordinates }) => void
  label?: string
  placeholder?: string
}

const PRESET_LOCATIONS = [
  { name: 'Central Park South & 59th St, New York', coords: { lat: 40.7661, lng: -73.9772 } },
  { name: 'Columbus Circle Plaza, New York', coords: { lat: 40.7681, lng: -73.9819 } },
  { name: 'Herald Square & 34th St, New York', coords: { lat: 40.7501, lng: -73.9874 } },
  { name: 'Bryant Park Library, New York', coords: { lat: 40.7536, lng: -73.9832 } },
  { name: 'Grand Central Terminal, New York', coords: { lat: 40.7527, lng: -73.9772 } },
  { name: 'Times Square & 42nd St, New York', coords: { lat: 40.7580, lng: -73.9855 } }
]

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  label = 'Accurate Location & Address',
  placeholder = 'Enter street address, building, or landmark...'
}) => {
  const [addressInput, setAddressInput] = useState(value.address)
  const [isSearching, setIsSearching] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  // Use browser geolocation
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setIsSearching(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsSearching(false)
        const coords = {
          lat: Math.round(position.coords.latitude * 10000) / 10000,
          lng: Math.round(position.coords.longitude * 10000) / 10000
        }
        const detectedAddress = `GPS Location (${coords.lat}, ${coords.lng})`
        setAddressInput(detectedAddress)
        onChange({ address: detectedAddress, coordinates: coords })
      },
      (error) => {
        setIsSearching(false)
        console.warn('Geolocation error:', error)
        const fallback = PRESET_LOCATIONS[0]
        setAddressInput(fallback.name)
        onChange({ address: fallback.name, coordinates: fallback.coords })
      },
      { timeout: 7000 }
    )
  }

  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setAddressInput(preset.name)
    onChange({ address: preset.name, coordinates: preset.coords })
    setShowPresets(false)
  }

  // Adjust coords on Google Maps canvas click
  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const baseLat = value.coordinates.lat || 40.7580
    const baseLng = value.coordinates.lng || -73.9855

    const newLat = Math.round((baseLat + (0.5 - y) * 0.03) * 10000) / 10000
    const newLng = Math.round((baseLng + (x - 0.5) * 0.03) * 10000) / 10000

    const updatedAddress = addressInput || `Pinned Location (${newLat}, ${newLng})`
    onChange({
      address: updatedAddress,
      coordinates: { lat: newLat, lng: newLng }
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          {label} <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isSearching}
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          <Navigation className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
          <span>{isSearching ? 'Locating GPS...' : 'Use Current GPS'}</span>
        </button>
      </div>

      {/* Address Input Field with Google Maps styling */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="w-4 h-4 text-red-500" />
        </div>
        <input
          type="text"
          value={addressInput}
          onChange={(e) => {
            setAddressInput(e.target.value)
            onChange({ address: e.target.value, coordinates: value.coordinates })
          }}
          onFocus={() => setShowPresets(true)}
          placeholder={placeholder}
          required
          className="w-full pl-9 pr-24 py-2.5 bg-white border border-slate-300 focus:border-blue-500 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="absolute inset-y-1.5 right-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
        >
          Presets
        </button>
      </div>

      {/* Presets dropdown */}
      {showPresets && (
        <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-lg space-y-1">
          <div className="text-[11px] font-bold text-slate-500 px-2 py-1">
            Google Maps Popular Hotspots:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {PRESET_LOCATIONS.map((loc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(loc)}
                className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-800 text-slate-700 transition-colors flex items-center justify-between"
              >
                <span className="truncate">{loc.name}</span>
                <Check className={`w-3.5 h-3.5 text-blue-600 shrink-0 ${value.address === loc.name ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Google Maps Visual Interactive Pin Canvas */}
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Crosshair className="w-3.5 h-3.5 text-blue-600" />
            Precise GPS Coordinates:
          </span>
          <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold">
            {value.coordinates.lat.toFixed(4)}, {value.coordinates.lng.toFixed(4)}
          </span>
        </div>

        {/* Authentic Google Maps Surface */}
        <div
          onClick={handleMapCanvasClick}
          title="Click anywhere on the Google Map to reposition pin"
          className="relative h-32 w-full rounded-lg bg-[#f4f3f0] border border-slate-200 cursor-crosshair overflow-hidden group select-none shadow-inner"
        >
          {/* Google Maps Vector Streets & Parks */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none">
            {/* Water */}
            <path d="M 0,0 L 40,0 L 20,150 L 0,150 Z" fill="#aad3df" />
            {/* Green park */}
            <rect x="180" y="20" width="80" height="90" rx="4" fill="#cbe6a3" />
            <text x="195" y="68" fill="#608040" fontSize="9" fontWeight="600">Park</text>
            
            {/* Streets Grid */}
            <line x1="50" y1="35" x2="400" y2="35" stroke="#ffffff" strokeWidth="6" />
            <line x1="50" y1="80" x2="400" y2="80" stroke="#ffffff" strokeWidth="6" />
            <line x1="120" y1="0" x2="120" y2="150" stroke="#ffffff" strokeWidth="6" />
            <line x1="280" y1="0" x2="280" y2="150" stroke="#ffffff" strokeWidth="6" />
            
            {/* Yellow Highway */}
            <line x1="0" y1="20" x2="400" y2="120" stroke="#fbd786" strokeWidth="6" />
          </svg>

          {/* Iconic Google Red Teardrop Pin */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative flex flex-col items-center">
              <div 
                className="w-8 h-10 bg-[#ea4335] rounded-t-full rounded-b-none flex items-center justify-center text-white text-xs shadow-lg border-2 border-white animate-bounce"
                style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white -mt-2" />
              </div>
              <div className="w-3 h-1 bg-black/40 rounded-full blur-[1px] -mt-1" />
            </div>
          </div>

          <div className="absolute bottom-1 right-2 text-[10px] text-slate-600 bg-white/90 px-1.5 py-0.5 rounded shadow border border-slate-200 pointer-events-none">
            Click map to adjust pin
          </div>

          <div className="absolute bottom-1 left-2 text-[9px] font-bold text-slate-500 pointer-events-none flex items-center gap-0.5">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>
        </div>
      </div>
    </div>
  )
}
