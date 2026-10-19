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

    // Build unique Item entity
    const newItem: Item = {
      id: `lost_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.id,
      userName: userName.trim() || currentUser.name,
      userEmail: userEmail.trim() || currentUser.email,
      userPhone: userPhone.trim(),
      type: 'lost',
      title: title.trim(),
      category,
      brand: brand.trim(),
      model: model.trim(),
      color: color.trim(),
      description: description.trim(),
      photos: photos.length > 0 ? photos : [SAMPLE_PHOTO_PRESETS[0].url],
      locationAddress: locationData.address,
      coordinates: locationData.coordinates,
      shippingAddress: shippingAddress.trim(),
      secretVerificationHint: secretHint.trim(),
      dateReported: new Date().toISOString(),
      incidentDate: new Date(incidentDate).toISOString(),
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-50 via-white to-red-50 border border-rose-200/80 p-8 shadow-xs">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold uppercase tracking-wider mb-3">
            <Package className="w-3.5 h-3.5 text-rose-600" />
            <span>Interface 1: Owner Registration & Lost Item Upload</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Lost Something Valuable?
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            Report what you lost with photos and the accurate location. Our multi-modal AI constantly scans found reports. When matched, a verified courier will safely pick it up from the finder and ship it directly to your doorstep.
          </p>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-rose-200/40 blur-3xl pointer-events-none" />
      </div>

      {submittedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">Lost Item Registered Successfully!</div>
              <div className="text-xs text-emerald-700">AI Radar has begun continuous spatial & visual matching across all found items.</div>
            </div>
          </div>
          <button
            onClick={() => onNavigateToMatch(items[0]?.id || '')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>View AI Radar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Owner Contact & Registration */}
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center text-xs font-bold">1</span>
                Owner Registration & Contact Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                    placeholder="Alex Johnson"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                    placeholder="alex@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone (for Courier OTP)</label>
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                    placeholder="+1 (555) 234-5678"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Step 2: Category & Item Specs */}
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center text-xs font-bold">2</span>
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
                        ? 'bg-rose-50 text-rose-700 border border-rose-400 font-bold shadow-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Item Title / Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Apple iPhone 15 Pro (Natural Titanium)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / Maker</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Apple, Sony, Fossil"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Model / Specs</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. 15 Pro 256GB"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Color / Case</label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. Blue case, Silver"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Physical Description & Identifying Marks <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe exact details: stickers, scratches, protective case type, wallpaper, accessories attached, contents inside wallet, etc."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white placeholder-slate-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Step 3: Photo Upload */}
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center text-xs font-bold">3</span>
                Upload Photos of the Lost Item
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                Upload pictures of your gadget, box, or receipt for AI neural vision matching.
              </p>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-2xl p-5 text-center bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm font-bold text-rose-600 hover:text-rose-700">Choose a photo</span>
                  <span className="text-sm text-slate-600"> or drag and drop here</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>
                <div className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</div>
              </div>

              {/* Quick Preset Photos */}
              <div className="mt-3">
                <div className="text-[11px] text-slate-500 font-medium mb-1.5">Or use a sample gadget photo for instant testing:</div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPresetPhoto(preset.url)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5 transition-colors font-medium"
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
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                      <img src={p} alt="Uploaded item" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Step 4: Accurate Place/Address Where Lost */}
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center text-xs font-bold">4</span>
                Accurate Address Where It Was Lost
              </h2>
              
              <LocationPicker
                value={locationData}
                onChange={setLocationData}
                label="Loss Location & Address"
                placeholder="Where did you lose it? (e.g., Central Park bench, Subway station, Cafe...)"
              />

              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Date & Time of Loss</label>
                <input
                  type="datetime-local"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Step 5: Shipping Destination & Secret Ownership Verification */}
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center text-xs font-bold">5</span>
                Return Shipping Address & Ownership Verification
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Your Shipping Delivery Address <span className="text-rose-600">*</span></span>
                    <span className="text-[11px] text-blue-600 font-medium">Where courier will deliver once found</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace, Apt 4B, New York, NY 10023"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      Secret Verification Detail (Encrypted)
                    </span>
                    <span className="text-[11px] text-slate-400">Known only to legitimate owner</span>
                  </label>
                  <input
                    type="text"
                    value={secretHint}
                    onChange={(e) => setSecretHint(e.target.value)}
                    placeholder="e.g. Lockscreen photo is of dog named Buster / Last 3 digits of serial number / specific ID card name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transform active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{isSubmitting ? 'Registering Item & Activating AI Radar...' : 'Submit Lost Report & Activate AI Radar'}</span>
            </button>
          </form>
        </div>

        {/* Sidebar: Active Lost Reports & Tracking */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-rose-600" />
                <span>Your Active Lost Items ({userLostItems.length})</span>
              </h2>
              <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200 font-bold">
                Live Radar
              </span>
            </div>

            <div className="space-y-4">
              {userLostItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex gap-3">
                    <img 
                      src={item.photos[0] || SAMPLE_PHOTO_PRESETS[0].url} 
                      alt={item.title} 
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          item.status === 'matched' ? 'bg-purple-100 text-purple-800 border border-purple-200 animate-pulse' :
                          item.status === 'in_transit' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 truncate mt-1">{item.title}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                        <span className="truncate">{item.locationAddress}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Pipeline Progress Indicator */}
                  <div className="pt-2 border-t border-slate-200">
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-medium">
                      <div className="p-1 rounded bg-rose-100 text-rose-800 border border-rose-200 font-semibold">
                        1. Reported
                      </div>
                      <div className={`p-1 rounded border ${
                        item.status === 'matched' || item.status === 'courier_assigned' || item.status === 'in_transit' || item.status === 'delivered'
                          ? 'bg-purple-100 text-purple-800 border-purple-200 font-semibold'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                        2. AI Matched
                      </div>
                      <div className={`p-1 rounded border ${
                        item.status === 'in_transit' || item.status === 'delivered'
                          ? 'bg-blue-100 text-blue-800 border-blue-200 font-semibold'
                          : item.status === 'courier_assigned'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                        3. In Courier
                      </div>
                      <div className={`p-1 rounded border ${
                        item.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                        4. Returned
                      </div>
                    </div>
                  </div>

                  {/* CLEAR LIVE COURIER TRACKING MAP FOR OWNER (Authentic Google Maps Look) */}
                  {(item.status === 'in_transit' || item.status === 'courier_assigned') && (
                    <div className="rounded-2xl overflow-hidden border border-blue-200 bg-white p-3 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Google Maps Live Transit (En Route)</span>
                        </span>
                        <span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                          ETA: 15-20 Min
                        </span>
                      </div>

                      {/* Google Maps Styled Route Canvas */}
                      <div 
                        className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-300"
                        style={{ backgroundColor: '#f4f3f0' }}
                      >
                        {/* Street & Route Graphics */}
                        <svg className="absolute inset-0 w-full h-full">
                          {/* Park green patch */}
                          <rect x="15" y="10" width="80" height="40" rx="4" fill="#cbe6a3" />
                          {/* White street network */}
                          <line x1="0" y1="50" x2="300" y2="50" stroke="#ffffff" strokeWidth="6" />
                          <line x1="0" y1="85" x2="300" y2="85" stroke="#ffffff" strokeWidth="6" />
                          <line x1="80" y1="0" x2="80" y2="130" stroke="#ffffff" strokeWidth="7" />
                          <line x1="220" y1="0" x2="220" y2="130" stroke="#ffffff" strokeWidth="7" />
                          
                          {/* Google Blue Route Line */}
                          <line x1="20%" y1="70%" x2="80%" y2="30%" stroke="#174ea6" strokeWidth="6" opacity="0.4" />
                          <line x1="20%" y1="70%" x2="80%" y2="30%" stroke="#1a73e8" strokeWidth="4" />
                          <line x1="20%" y1="70%" x2="80%" y2="30%" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                        </svg>

                        {/* Finder Pickup Point (Google Green Pin A) */}
                        <div className="absolute left-[20%] top-[70%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
                          <svg width="24" height="28" viewBox="0 0 24 32">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="#34a853" />
                            <circle cx="12" cy="11" r="5" fill="#ffffff" />
                            <text x="12" y="14" fill="#188038" fontSize="9" fontWeight="bold" textAnchor="middle">A</text>
                          </svg>
                          <span className="text-[9px] font-bold text-emerald-800 bg-white/90 border border-emerald-200 px-1 rounded shadow-xs whitespace-nowrap">
                            Finder
                          </span>
                        </div>

                        {/* Moving Courier */}
                        <div className="absolute left-[54%] top-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                          <div className="w-7 h-7 rounded-xl bg-[#1a73e8] text-white flex items-center justify-center shadow-md border-2 border-white">
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px] font-bold text-blue-700 bg-white/90 border border-blue-200 px-1 rounded shadow-xs whitespace-nowrap">
                            Courier Marco
                          </span>
                        </div>

                        {/* Owner Delivery Point (Google Red Pin B) */}
                        <div className="absolute left-[80%] top-[30%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
                          <svg width="24" height="28" viewBox="0 0 24 32">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="#ea4335" />
                            <circle cx="12" cy="11" r="5" fill="#ffffff" />
                            <text x="12" y="14" fill="#b31412" fontSize="9" fontWeight="bold" textAnchor="middle">B</text>
                          </svg>
                          <span className="text-[9px] font-bold text-rose-800 bg-white/90 border border-rose-200 px-1 rounded shadow-xs whitespace-nowrap">
                            Your Doorstep
                          </span>
                        </div>

                        {/* Google logo mark */}
                        <div className="absolute bottom-0.5 left-1 text-[8px] font-bold text-slate-500 font-sans">
                          Google
                        </div>
                      </div>

                      {/* Secret Delivery OTP for Owner */}
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 font-medium">Your Secure Delivery OTP:</div>
                          <div className="text-base font-black text-blue-800 font-mono tracking-widest">3175</div>
                        </div>
                        <span className="text-[10px] text-blue-700 font-medium max-w-[170px] text-right">
                          Give this OTP to the courier only upon physical inspection.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Link to AI Match Hub if matched */}
                  {item.status === 'matched' && (
                    <button
                      onClick={() => onNavigateToMatch(item.id)}
                      className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
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
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              How the AI & Delivery System Protects You
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
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
