import React, { useState } from 'react'
import { MapPin, Navigation, Search, Check, Crosshair } from 'lucide-react'
import { Coordinates } from '../types'

interface LocationPickerProps {
  value: { address: string; coordinates: Coordinates }
  onChange: (val: { address: string; coordinates: Coordinates }) => void
  label?: string
  placeholder?: string
}

const PRESET_LOCATIONS = [
  { name: 'Central Park South, New York', coords: { lat: 40.7661, lng: -73.9772 } },
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
        // Fallback to a close NYC default
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

  // Adjust coords slightly on mini-radar click
  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width // 0 to 1
    const y = (e.clientY - rect.top) / rect.height // 0 to 1

    // Map x, y into slight delta around current coords
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
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label} <span className="text-red-400">*</span>
        </label>
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isSearching}
          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <Navigation className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
          <span>{isSearching ? 'Locating...' : 'Use My GPS'}</span>
        </button>
      </div>

      {/* Address Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <MapPin className="w-4 h-4 text-rose-400" />
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
          className="w-full pl-9 pr-24 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-indigo-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="absolute inset-y-1.5 right-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-600 transition-colors"
        >
          Presets
        </button>
      </div>

      {/* Presets dropdown */}
      {showPresets && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-xl space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">
            Quick Select Common Hotspots:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {PRESET_LOCATIONS.map((loc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(loc)}
                className="text-left text-xs p-2 rounded-lg bg-slate-800/60 hover:bg-indigo-950/60 hover:text-indigo-200 text-slate-300 transition-colors flex items-center justify-between"
              >
                <span className="truncate">{loc.name}</span>
                <Check className={`w-3.5 h-3.5 text-indigo-400 shrink-0 ${value.address === loc.name ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mini Visual Coordinate Radar & Pin Picker */}
      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
            Precise GPS Coordinates:
          </span>
          <span className="font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
            {value.coordinates.lat.toFixed(4)}, {value.coordinates.lng.toFixed(4)}
          </span>
        </div>

        {/* Interactive Coordinate Grid Surface */}
        <div
          onClick={handleMapCanvasClick}
          title="Click anywhere on the radar grid to adjust pin placement"
          className="relative h-28 w-full rounded-lg bg-slate-900 border border-slate-800 cursor-crosshair overflow-hidden group select-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 70%),
              linear-gradient(to right, #1e293b 1px, transparent 1px),
              linear-gradient(to bottom, #1e293b 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 20px 20px, 20px 20px'
          }}
        >
          {/* Subtle radar circle pulse */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full border border-indigo-500/20 animate-ping opacity-75" />
            <div className="w-40 h-40 rounded-full border border-indigo-500/10" />
          </div>

          {/* Location Pin */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/50 animate-bounce">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
              <div className="w-3 h-1 bg-black/60 rounded-full blur-xs -mt-0.5" />
            </div>
          </div>

          <div className="absolute bottom-1 right-2 text-[10px] text-slate-500 bg-slate-950/80 px-1.5 py-0.5 rounded pointer-events-none">
            Click grid to refine pin
          </div>
        </div>
      </div>
    </div>
  )
}
