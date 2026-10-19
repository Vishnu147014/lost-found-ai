import React, { useState } from 'react'
import { 
  Gift, 
  Upload, 
  MapPin, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Tag, 
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
  Shield,
  ArrowRight,
  HeartHandshake
} from 'lucide-react'
import { Coordinates, Item, ItemCategory, UserProfile } from '../types'
import { LocationPicker } from './LocationPicker'
import confetti from 'canvas-confetti'

interface FoundItemFormProps {
  currentUser: UserProfile
  items: Item[]
  onSubmitFoundItem: (item: Item) => void
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

const SAMPLE_FOUND_PHOTOS = [
  {
    name: 'iPhone in Navy Case',
    category: 'smartphone' as ItemCategory,
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    color: 'Navy Blue Case',
    url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'AirPods Pro Case',
    category: 'earbuds' as ItemCategory,
    brand: 'Apple',
    model: 'AirPods Pro 2',
    color: 'White',
    url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Black Leather Bifold',
    category: 'wallet' as ItemCategory,
    brand: 'Fossil',
    model: 'Leather Wallet',
    color: 'Black/Dark Brown',
    url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'
  }
]

export const FoundItemForm: React.FC<FoundItemFormProps> = ({
  currentUser,
  items,
  onSubmitFoundItem,
  onNavigateToMatch
}) => {
  const [finderName, setFinderName] = useState(currentUser.name)
  const [finderEmail, setFinderEmail] = useState(currentUser.email)
  const [finderPhone, setFinderPhone] = useState(currentUser.phone || '+1 (555) 876-5432')

  const [category, setCategory] = useState<ItemCategory>('smartphone')
  const [title, setTitle] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState('')
  const [description, setDescription] = useState('')
  const [foundDate, setFoundDate] = useState(new Date().toISOString().slice(0, 16))

  const [locationData, setLocationData] = useState<{ address: string; coordinates: Coordinates }>({
    address: 'Columbus Circle Park Plaza, New York, NY 10019',
    coordinates: { lat: 40.7681, lng: -73.9819 }
  })

  const [photos, setPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  // Auto-fill preset helper
  const handleSelectPreset = (preset: typeof SAMPLE_FOUND_PHOTOS[0]) => {
    setPhotos([preset.url])
    setCategory(preset.category)
    setBrand(preset.brand)
    setModel(preset.model)
    setColor(preset.color)
    setTitle(`Found ${preset.brand} ${preset.model} (${preset.color})`)
    setDescription(`Found intact on a bench/table. Safely preserved and awaiting legitimate owner verification.`)
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const finalPhotos = photos.length > 0 ? photos : [SAMPLE_FOUND_PHOTOS[0].url]

    const newItem: Item = {
      id: `item_found_${Date.now()}`,
      userId: currentUser.id,
      userName: finderName,
      userEmail: finderEmail,
      userPhone: finderPhone,
      type: 'found',
      title: title || `Found ${category.toUpperCase()}`,
      category,
      brand,
      model,
      color,
      description,
      photos: finalPhotos,
      locationAddress: locationData.address,
      coordinates: locationData.coordinates,
      dateReported: new Date().toISOString(),
      incidentDate: new Date(foundDate).toISOString(),
      status: 'reported',
      createdAt: new Date().toISOString()
    }

    setTimeout(() => {
      onSubmitFoundItem(newItem)
      setIsSubmitting(false)
      setSubmittedSuccess(true)

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      })

      // Reset
      setTitle('')
      setDescription('')
      setBrand('')
      setModel('')
      setColor('')
      setPhotos([])

      setTimeout(() => setSubmittedSuccess(false), 5000)
    }, 600)
  }

  // Strict role isolation: only items reported found by this user
  const userFoundItems = items.filter(it => 
    it.type === 'found' && (it.userId === currentUser.id || it.userEmail === currentUser.email || currentUser.role === 'admin')
  )


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* Hero Banner with Finder 30% Shipping Discount Reward Highlight */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/70 border border-emerald-900/50 p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Gift className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interface 2: Good Samaritan Registration & Found Item Upload</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Found an Item? Return It & Earn Rewards
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Upload a photo of the item you discovered and where you found it. When AI matches it to its owner and the courier collects it from you, <strong className="text-amber-300">you will automatically receive a 30% shipping discount voucher for your next lost item report</strong>!
          </p>

          {/* Good Samaritan Reward Card Callout */}
          <div className="mt-5 inline-flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/40 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>Good Samaritan Incentive Active</span>
                <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                  30% Off Shipping
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                You currently have <strong className="text-white">{currentUser.finderDiscountTokens} voucher(s)</strong>. Every successful reunion earns another voucher!
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      </div>

      {submittedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-sm">Found Item Uploaded & Safe Custody Registered!</div>
              <div className="text-xs text-emerald-300/80">AI Radar is now scanning lost reports in your vicinity to match with the owner.</div>
            </div>
          </div>
          <button
            onClick={() => onNavigateToMatch(items[0]?.id || '')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Check AI Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Card */}
        <div className="lg:col-span-7 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Step 1: Finder Details */}
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">1</span>
                Finder Registration & Contact Info
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={finderName}
                    onChange={(e) => setFinderName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    placeholder="Elena Rostova"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email (for 30% Voucher)</label>
                  <input
                    type="email"
                    required
                    value={finderEmail}
                    onChange={(e) => setFinderEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    placeholder="elena@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Phone (for Courier Pickup OTP)</label>
                  <input
                    type="tel"
                    required
                    value={finderPhone}
                    onChange={(e) => setFinderPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    placeholder="+1 (555) 876-5432"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Step 2: Found Item Photo Upload & AI Auto-Tag */}
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">2</span>
                Upload Photo of the Found Item
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                Take a clear picture of the item. Our neural model extracts visual geometry and color codes to detect lost counterparts.
              </p>

              {/* Photo Upload Zone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-4 text-center bg-slate-950/60 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">Take or upload a photo</span>
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

              {/* Instant Test Presets */}
              <div className="mt-3">
                <div className="text-[11px] text-slate-400 font-medium mb-1.5">Or auto-fill with a realistic found item preset:</div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_FOUND_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <img src={preset.url} alt={preset.name} className="w-4 h-4 rounded object-cover" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Uploaded photo display */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                      <img src={p} alt="Found item" className="w-full h-full object-cover" />
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

            {/* Step 3: Item Classification */}
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">3</span>
                Item Details & Category
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      category === cat.id
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 border border-emerald-500'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {cat.icon}
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Item Title <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Found iPhone in Navy Blue Case"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Brand (if visible)</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Apple, Sony"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Model / Type</label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. iPhone 15 Pro"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Color / Distinctive Look</label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. Navy Blue Case"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Found Description & Condition <span className="text-emerald-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe where it was resting, current condition, battery state, safe custody notes."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Step 4: Accurate Found Location */}
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">4</span>
                Accurate Address Where You Found It
              </h2>

              <LocationPicker
                value={locationData}
                onChange={setLocationData}
                label="Found Location & Address"
                placeholder="Exact spot where you found the item (e.g. Columbus Circle Plaza)"
              />

              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-400 mb-1">Date & Time Found</label>
                <input
                  type="datetime-local"
                  value={foundDate}
                  onChange={(e) => setFoundDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2 transform active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering Found Item & Scanning...' : 'Register Found Item & Claim 30% Reward Eligibility'}</span>
            </button>
          </form>
        </div>

        {/* Sidebar: Finder Profile & Recent Found Items */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Samaritan Score Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{currentUser.name}</h3>
                  <p className="text-xs text-emerald-400 font-medium">Good Samaritan Level 2</p>
                </div>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/40 font-bold">
                {currentUser.finderDiscountTokens}x 30% Off
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                <div className="text-xl font-extrabold text-white">{currentUser.itemsReportedFound}</div>
                <div className="text-[11px] text-slate-400">Items Found</div>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                <div className="text-xl font-extrabold text-emerald-400">{currentUser.successfulReunions}</div>
                <div className="text-[11px] text-slate-400">Owners Reunited</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
              <strong>Your Good Samaritan Benefit:</strong> Whenever you return an item, you unlock a 30% discount token. If you ever lose an item in the future, your courier shipping charges are reduced by 30%!
            </div>
          </div>

          {/* List of Found Items */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span>Items You Have Found ({userFoundItems.length})</span>
            </h3>

            <div className="space-y-3">
              {userFoundItems.map(item => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <div className="flex gap-3">
                    <img 
                      src={item.photos[0] || SAMPLE_FOUND_PHOTOS[0].url} 
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/50">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 truncate mt-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{item.locationAddress}</span>
                      </p>
                    </div>
                  </div>

                  {/* Courier Pickup OTP for Finder */}
                  {(item.status === 'in_transit' || item.status === 'courier_assigned') && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-emerald-400 font-semibold">Your 4-Digit Pickup OTP:</div>
                        <div className="text-base font-black text-white font-mono tracking-widest">8492</div>
                      </div>
                      <span className="text-[10px] text-emerald-300 max-w-[160px] text-right">
                        Provide this code to courier Marco at pickup to release the item.
                      </span>
                    </div>
                  )}

                  {item.status === 'matched' && (
                    <button
                      onClick={() => onNavigateToMatch(item.id)}
                      className="w-full py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Owner Match Identified! Inspect</span>
                    </button>
                  )}
                </div>
              ))}

            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
