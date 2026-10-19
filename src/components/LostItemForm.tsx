import React, { useState } from 'react'
import { 
  Upload, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  Smartphone, 
  Headphones, 
  Laptop, 
  Wallet, 
  Key, 
  Watch, 
  FileText, 
  Gem, 
  ShoppingBag, 
  HelpCircle,
  Truck,
  ArrowRight
} from 'lucide-react'
import { Coordinates, Item, ItemCategory, UserProfile } from '../types'
import { LocationPicker } from './LocationPicker'
import confetti from 'canvas-confetti'

interface LostItemFormProps {
  currentUser: UserProfile
  items: Item[]
  onSubmitLostItem: (item: Item) => void
  onNavigateToMatch: (itemId: string) => void
}

const CATEGORIES: { id: ItemCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'smartphone', label: 'Phone', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'earbuds', label: 'Earbuds / AirPods', icon: <Headphones className="w-4 h-4" /> },
  { id: 'laptop', label: 'Laptop / Tablet', icon: <Laptop className="w-4 h-4" /> },
  { id: 'wallet', label: 'Wallet / Purse', icon: <Wallet className="w-4 h-4" /> },
  { id: 'keys', label: 'Keys', icon: <Key className="w-4 h-4" /> },
  { id: 'smartwatch', label: 'Smartwatch', icon: <Watch className="w-4 h-4" /> },
  { id: 'documents', label: 'IDs / Passport', icon: <FileText className="w-4 h-4" /> },
  { id: 'jewelry', label: 'Jewelry / Ring', icon: <Gem className="w-4 h-4" /> },
  { id: 'bag', label: 'Backpack / Bag', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'other', label: 'Other Item', icon: <HelpCircle className="w-4 h-4" /> },
]

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'iPhone 15 Pro',
    url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'AirPods Pro',
    url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Leather Wallet',
    url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'MacBook Air',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
  }
]

export const LostItemForm: React.FC<LostItemFormProps> = ({
  currentUser,
  items,
  onSubmitLostItem,
  onNavigateToMatch
}) => {
  const [userName, setUserName] = useState(currentUser.name)
  const [userEmail, setUserEmail] = useState(currentUser.email)
  const [userPhone, setUserPhone] = useState(currentUser.phone || '+1 (555) 234-5678')
  
  const [category, setCategory] = useState<ItemCategory>('smartphone')
  const [title, setTitle] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState('')
  const [description, setDescription] = useState('')
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 16))
  
  const [locationData, setLocationData] = useState<{ address: string; coordinates: Coordinates }>({
    address: 'Central Park South & 59th St, New York, NY 10019',
    coordinates: { lat: 40.7661, lng: -73.9772 }
  })
  
  const [shippingAddress, setShippingAddress] = useState(currentUser.savedShippingAddress || '742 Evergreen Terrace, Apt 4B, New York, NY')
  const [secretHint, setSecretHint] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotos(prev => [...prev, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddPresetPhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos(prev => [...prev, url])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const finalPhotos = photos.length > 0 ? photos : [SAMPLE_PHOTO_PRESETS[0].url]

    const newItem: Item = {
      id: `item_lost_${Date.now()}`,
      userId: currentUser.id,
      userName,
      userEmail,
      userPhone,
      type: 'lost',
      title: title || `${brand || ''} ${model || category}`.trim() || 'Lost Valued Item',
      category,
      brand,
      model,
      color,
      description,
      photos: finalPhotos,
      locationAddress: locationData.address,
      coordinates: locationData.coordinates,
      dateReported: new Date().toISOString(),
      incidentDate: new Date(incidentDate).toISOString(),
      shippingAddress,
      secretVerificationHint: secretHint,
      status: 'reported',
      createdAt: new Date().toISOString()
    }

    setTimeout(() => {
      onSubmitLostItem(newItem)
      setIsSubmitting(false)
      setSubmittedSuccess(true)
      
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      })

      // Reset form
      setTitle('')
      setDescription('')
      setBrand('')
      setModel('')
      setColor('')
      setSecretHint('')
      setPhotos([])
      
      setTimeout(() => setSubmittedSuccess(false), 5000)
    }, 600)
  }

  // Filter user's reported lost items (Strict role isolation)
  const userLostItems = items.filter(it => 
    it.type === 'lost' && (it.userId === currentUser.id || it.userEmail === currentUser.email || currentUser.role === 'admin')
  )


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/80 via-slate-900 to-indigo-950/70 border border-red-900/40 p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Package className="w-3.5 h-3.5" />
            <span>Interface 1: Owner Registration & Lost Item Upload</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Lost Something Valuable?
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Report what you lost with photos and the accurate location. Our multi-modal AI constantly scans found reports. When matched, a verified courier will safely pick it up from the finder and ship it directly to your doorstep.
          </p>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
      </div>

      {submittedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-sm">Lost Item Registered Successfully!</div>
              <div className="text-xs text-emerald-300/80">AI Radar has begun continuous spatial & visual matching across all found items.</div>
            </div>
          </div>
          <button
            onClick={() => onNavigateToMatch(items[0]?.id || '')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>View AI Radar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Card */}
        <div className="lg:col-span-7 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Owner Contact & Registration */}
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xs">1</span>
                Owner Registration & Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-red-500"
                    placeholder="Alex Johnson"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-red-500"
                    placeholder="alex@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Phone (for Courier OTP)</label>
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-red-500"
                    placeholder="+1 (555) 234-5678"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Step 2: Category & Item Specs */}
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xs">2</span>
                What Did You Lose?
              </h2>

              {/* Category Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      category === cat.id
                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border border-red-500'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {cat.icon}
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Title & Brand Specs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Item Title / Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Apple iPhone 15 Pro (Natural Titanium)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Brand / Maker</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Apple, Sony, Fossil"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Model / Specs</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. 15 Pro 256GB"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Primary Color / Case</label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. Blue case, Silver"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Detailed Physical Description & Identifying Marks <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe exact details: stickers, scratches, protective case type, wallpaper, accessories attached, contents inside wallet, etc."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-red-500 placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Step 3: Photo Upload */}
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xs">3</span>
                Upload Photos of the Lost Item
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                Upload existing pictures of your gadget, box, or receipt for AI neural vision matching.
              </p>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-red-500/60 rounded-2xl p-4 text-center bg-slate-950/60 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm font-semibold text-red-400 hover:text-red-300">Choose a photo</span>
                  <span className="text-sm text-slate-400"> or drag and drop here</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>
                <div className="text-[11px] text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB</div>
              </div>

              {/* Quick Preset Photos */}
              <div className="mt-3">
                <div className="text-[11px] text-slate-400 font-medium mb-1.5">Or use a sample gadget photo for instant testing:</div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPresetPhoto(preset.url)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <img src={preset.url} alt={preset.name} className="w-4 h-4 rounded object-cover" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Preview Grid */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                      <img src={p} alt="Uploaded item" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-slate-800" />

            {/* Step 4: Accurate Place/Address Where Lost */}
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xs">4</span>
                Accurate Address Where It Was Lost
              </h2>
              
              <LocationPicker
                value={locationData}
                onChange={setLocationData}
                label="Loss Location & Address"
                placeholder="Where did you lose it? (e.g., Central Park bench, Subway station, Cafe...)"
              />

              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-400 mb-1">Estimated Date & Time of Loss</label>
                <input
                  type="datetime-local"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Step 5: Shipping Destination & Secret Ownership Verification */}
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xs">5</span>
                Return Shipping Address & Ownership Verification
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
                    <span>Your Shipping Delivery Address <span className="text-red-400">*</span></span>
                    <span className="text-[11px] text-cyan-400">Where courier will deliver once found</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace, Apt 4B, New York, NY 10023"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Secret Verification Detail (Encrypted)
                    </span>
                    <span className="text-[11px] text-slate-500">Known only to legitimate owner</span>
                  </label>
                  <input
                    type="text"
                    value={secretHint}
                    onChange={(e) => setSecretHint(e.target.value)}
                    placeholder="e.g. Lockscreen photo is of dog named Buster / Last 3 digits of serial number / specific ID card name"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-red-900/30 flex items-center justify-center gap-2 transform active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{isSubmitting ? 'Registering Item & Activating AI Radar...' : 'Submit Lost Report & Activate AI Radar'}</span>
            </button>
          </form>
        </div>

        {/* Sidebar: Active Lost Reports & Tracking */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-red-400" />
                <span>Your Active Lost Items ({userLostItems.length})</span>
              </h2>
              <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-semibold">
                Live Radar
              </span>
            </div>

            <div className="space-y-4">
              {userLostItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex gap-3">
                    <img 
                      src={item.photos[0] || SAMPLE_PHOTO_PRESETS[0].url} 
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/50">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          item.status === 'matched' ? 'bg-purple-950 text-purple-300 border border-purple-800 animate-pulse' :
                          item.status === 'in_transit' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                          'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-100 truncate mt-1">{item.title}</h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{item.locationAddress}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Pipeline Progress Indicator */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-medium">
                      <div className="p-1 rounded bg-red-950/50 text-red-300 border border-red-800/40">
                        1. Reported
                      </div>
                      <div className={`p-1 rounded border ${
                        item.status === 'matched' || item.status === 'courier_assigned' || item.status === 'in_transit' || item.status === 'delivered'
                          ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                          : 'bg-slate-900 text-slate-600 border-slate-800'
                      }`}>
                        2. AI Matched
                      </div>
                      <div className={`p-1 rounded border ${
                        item.status === 'in_transit' || item.status === 'delivered'
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                          : item.status === 'courier_assigned'
                          ? 'bg-cyan-950/40 text-cyan-400 border-cyan-900'
                          : 'bg-slate-900 text-slate-600 border-slate-800'
                      }`}>
                        3. In Courier
                      </div>
                      <div className={`p-1 rounded border ${
                        item.status === 'delivered'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : 'bg-slate-900 text-slate-600 border-slate-800'
                      }`}>
                        4. Returned
                      </div>
                    </div>
                  </div>

                  {/* CLEAR LIVE COURIER TRACKING MAP FOR OWNER */}
                  {(item.status === 'in_transit' || item.status === 'courier_assigned') && (
                    <div className="rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 p-3 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Live Delivery Tracking (En Route)</span>
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                          ETA: 15-20 Min
                        </span>
                      </div>

                      {/* Mini Live Map */}
                      <div 
                        className="relative h-28 w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden"
                        style={{
                          backgroundImage: `
                            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.12) 0%, transparent 70%),
                            linear-gradient(to right, #1e293b 1px, transparent 1px),
                            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
                          `,
                          backgroundSize: '100% 100%, 20px 20px, 20px 20px'
                        }}
                      >
                        <svg className="absolute inset-0 w-full h-full">
                          <line x1="20%" y1="70%" x2="80%" y2="30%" stroke="#06b6d4" strokeWidth="3" strokeDasharray="5 3" className="animate-pulse" />
                        </svg>

                        {/* Finder Pickup Point */}
                        <div className="absolute left-[20%] top-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] border border-white">
                            A
                          </div>
                          <span className="mt-0.5 text-[9px] text-emerald-300 bg-slate-950/80 px-1 rounded whitespace-nowrap">
                            Finder
                          </span>
                        </div>

                        {/* Moving Courier */}
                        <div className="absolute left-[54%] top-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                          <div className="w-7 h-7 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg border border-white">
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px] font-bold text-cyan-300 bg-cyan-950 px-1 rounded whitespace-nowrap">
                            Courier Marco
                          </span>
                        </div>

                        {/* Owner Delivery Point */}
                        <div className="absolute left-[80%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] border border-white">
                            B
                          </div>
                          <span className="mt-0.5 text-[9px] text-blue-300 bg-slate-950/80 px-1 rounded whitespace-nowrap">
                            Your Doorstep
                          </span>
                        </div>
                      </div>

                      {/* Secret Delivery OTP for Owner */}
                      <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400">Your Secure Delivery OTP:</div>
                          <div className="text-base font-black text-cyan-300 font-mono tracking-widest">3175</div>
                        </div>
                        <span className="text-[10px] text-cyan-400 max-w-[170px] text-right">
                          Give this OTP to the courier only upon physical inspection.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Link to AI Match Hub if matched */}
                  {item.status === 'matched' && (
                    <button
                      onClick={() => onNavigateToMatch(item.id)}
                      className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-purple-950"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Review High-Confidence AI Match & Ship</span>
                    </button>
                  )}
                </div>
              ))}

            </div>
          </div>

          {/* Quick FAQ info widget */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              How the AI & Delivery System Protects You
            </h3>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>AI extracts visual contours and matches against found items within minutes.</li>
              <li>Secret verification hint ensures no unauthorized person can claim your item.</li>
              <li>A verified courier delivers the item directly to your specified address.</li>
              <li>Couriers are paid automatically based on distance + item care handling.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}
