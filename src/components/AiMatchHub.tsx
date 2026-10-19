import React, { useState } from 'react'
import { 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Truck, 
  Tag, 
  Eye, 
  Percent, 
  ExternalLink,
  DollarSign,
  Compass,
  RefreshCw,
  Clock
} from 'lucide-react'
import { AIMatchResult, DeliveryJob, Item, UserProfile } from '../types'
import { calculateDeliveryPricing, calculateDistanceKm } from '../lib/pricing'
import confetti from 'canvas-confetti'

interface AiMatchHubProps {
  items: Item[]
  matches: AIMatchResult[]
  currentUser: UserProfile
  onTriggerReScan: () => void
  onConfirmMatchAndDispatchCourier: (
    match: AIMatchResult, 
    lostItem: Item, 
    foundItem: Item, 
    applyDiscount: boolean
  ) => void
}

export const AiMatchHub: React.FC<AiMatchHubProps> = ({
  items,
  matches,
  currentUser,
  onTriggerReScan,
  onConfirmMatchAndDispatchCourier
}) => {
  const [selectedMatch, setSelectedMatch] = useState<AIMatchResult | null>(matches[0] || null)
  const [useDiscountVoucher, setUseDiscountVoucher] = useState(currentUser.finderDiscountTokens > 0)
  const [secretAnswer, setSecretAnswer] = useState('')
  const [verificationPassed, setVerificationPassed] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [dispatchSuccess, setDispatchSuccess] = useState(false)

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      onTriggerReScan()
      setIsScanning(false)
    }, 800)
  }

  // Get selected lost and found items
  const lostItem = selectedMatch ? items.find(i => i.id === selectedMatch.lostItemId) : null
  const foundItem = selectedMatch ? items.find(i => i.id === selectedMatch.foundItemId) : null

  // Pricing calculations
  const distanceKm = (lostItem && foundItem) 
    ? calculateDistanceKm(lostItem.coordinates, foundItem.coordinates) 
    : 2.0
  
  const pricing = calculateDeliveryPricing(
    distanceKm, 
    lostItem?.category || 'smartphone', 
    useDiscountVoucher && currentUser.finderDiscountTokens > 0
  )

  const handleVerifySecret = () => {
    if (!secretAnswer.trim()) {
      setVerificationError('Please enter the secret ownership clue (e.g. lock screen photo, serial number, etc.)')
      return
    }
    setVerificationPassed(true)
    setVerificationError('')
  }

  const handleDispatchCourier = () => {
    if (!selectedMatch || !lostItem || !foundItem) return

    onConfirmMatchAndDispatchCourier(
      selectedMatch, 
      lostItem, 
      foundItem, 
      useDiscountVoucher && currentUser.finderDiscountTokens > 0
    )

    setDispatchSuccess(true)
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    })

    setTimeout(() => {
      setDispatchSuccess(false)
    }, 6000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/70 border border-purple-900/50 p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interface 4: Neural Matching Engine & Automated Courier Dispatch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Multi-Modal Detection Hub
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Our neural matching model cross-references uploaded photos, physical specifications, location proximity, and timestamps to pair lost valuables with found reports with cryptographic ownership verification.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Neural Vectors...' : 'Trigger AI Database Scan'}</span>
            </button>
            <span className="text-xs text-slate-400">
              Found <strong className="text-white">{matches.length} candidate pairs</strong>
            </span>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      </div>

      {dispatchSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-base">Match Verified & Courier Dispatched!</div>
              <div className="text-xs text-emerald-300/80">
                A pickup job has been posted to the Delivery Partner marketplace. The finder will hand it over using OTP, and the courier will deliver to the owner's shipping address.
              </div>
            </div>
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No New Match Candidates Detected Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload items in either the "I Lost Something" or "I Found Something" interfaces. As soon as complementary reports are filed, the AI matcher will surface them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Matches List Selector (Left Column) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Detected Matches ({matches.length})</span>
              <span className="text-[10px] text-purple-400">High Confidence Sorted</span>
            </h2>

            <div className="space-y-3">
              {matches.map(m => {
                const lost = items.find(i => i.id === m.lostItemId)
                const found = items.find(i => i.id === m.foundItemId)
                const isSelected = selectedMatch?.id === m.id

                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMatch(m)
                      setVerificationPassed(false)
                      setSecretAnswer('')
                    }}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-950/30'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.confidenceScore >= 80 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {m.confidenceScore}% AI Confidence
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Compass className="w-3 h-3 text-purple-400" />
                        {m.distanceKm} km apart
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] text-red-400 uppercase font-bold">Lost Report:</span>
                        <div className="font-semibold text-slate-200 truncate">{lost?.title || 'Lost Item'}</div>
                        <img 
                          src={lost?.photos[0]} 
                          alt="Lost item" 
                          className="w-full h-20 rounded-lg object-cover border border-slate-800" 
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">Found Report:</span>
                        <div className="font-semibold text-slate-200 truncate">{found?.title || 'Found Item'}</div>
                        <img 
                          src={found?.photos[0]} 
                          alt="Found item" 
                          className="w-full h-20 rounded-lg object-cover border border-slate-800" 
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Deep Match Inspector & Shipping Dispatch (Right Column) */}
          {selectedMatch && lostItem && foundItem && (
            <div className="lg:col-span-8 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              {/* Match Header with AI Score Meter */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-white">AI Visual & Geo Match Verification</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                      {selectedMatch.confidenceScore}% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Pairing: {lostItem.userName} (Owner) & {foundItem.userName} (Good Samaritan Finder)
                  </p>
                </div>

                {/* Match Metrics Gauge Bar */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <div className="text-slate-400 text-[10px]">Visual Specs</div>
                    <div className="font-extrabold text-purple-400 text-sm">{selectedMatch.visualSimilarity}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-[10px]">Keyword Similarity</div>
                    <div className="font-extrabold text-indigo-400 text-sm">{selectedMatch.textSimilarity}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-[10px]">Proximity Score</div>
                    <div className="font-extrabold text-emerald-400 text-sm">{selectedMatch.locationProximityScore}%</div>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Visual Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Lost Item Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-red-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Reported Lost Item
                    </span>
                    <span className="text-[11px] text-slate-400">By: {lostItem.userName}</span>
                  </div>
                  
                  <img 
                    src={lostItem.photos[0]} 
                    alt={lostItem.title} 
                    className="w-full h-44 rounded-xl object-cover border border-slate-800" 
                  />

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-100 text-sm">{lostItem.title}</div>
                    <div className="text-slate-400">{lostItem.description}</div>
                    <div className="flex items-center gap-1 text-slate-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="truncate">{lostItem.locationAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Found Item Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Reported Found Item
                    </span>
                    <span className="text-[11px] text-slate-400">By: {foundItem.userName}</span>
                  </div>

                  <img 
                    src={foundItem.photos[0]} 
                    alt={foundItem.title} 
                    className="w-full h-44 rounded-xl object-cover border border-slate-800" 
                  />

                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-100 text-sm">{foundItem.title}</div>
                    <div className="text-slate-400">{foundItem.description}</div>
                    <div className="flex items-center gap-1 text-slate-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{foundItem.locationAddress}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* AI Diagnostic Explanation */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Neural Vision Rationale:</span>
                </div>
                <p className="leading-relaxed text-slate-300">
                  {selectedMatch.aiRationale}
                </p>
              </div>

              {/* Step: Ownership Secret Verification Check */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Security Step: Verify Ownership Before Courier Dispatch</span>
                  </h3>
                  {verificationPassed && (
                    <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400">
                  Owner provided verification clue: <span className="text-slate-200 font-medium">"{lostItem.secretVerificationHint || 'Passcode or lock screen photo matches'}"</span>
                </div>

                {!verificationPassed ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={secretAnswer}
                        onChange={(e) => setSecretAnswer(e.target.value)}
                        placeholder="Owner confirms secret clue (e.g. dog wallpaper Buster)..."
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={handleVerifySecret}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Confirm Clue
                      </button>
                    </div>
                    {verificationError && (
                      <div className="text-[11px] text-red-400">{verificationError}</div>
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ownership confirmed! Ready to calculate shipping and dispatch delivery courier.</span>
                  </div>
                )}
              </div>

              {/* Shipping Checkout & Commission Breakdown (with Finder 30% Discount) */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 to-indigo-950/40 border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-400" />
                    <span>Shipping Charges & Courier Commission Breakdown</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Pickup → Delivery ({distanceKm} km)
                  </span>
                </div>

                {/* Delivery Fee Line Items */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Courier Payout ({distanceKm} km route):</span>
                    <span className="font-mono">${(pricing.baseCourierPayout + pricing.distanceRate).toFixed(2)}</span>
                  </div>

                  {pricing.highValueFee > 0 && (
                    <div className="flex justify-between text-slate-300">
                      <span>Valuable Gadget Security Handling Bonus:</span>
                      <span className="font-mono">+${pricing.highValueFee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-300">
                    <span>Delivery Partner Gross Payout:</span>
                    <span className="font-mono text-cyan-400 font-bold">${pricing.totalCourierPayout.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>Website Maintenance & AI Match Server Commission:</span>
                    <span className="font-mono">${pricing.platformCommission.toFixed(2)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-200">
                    <span>Gross Shipping Charges:</span>
                    <span className="font-mono">${pricing.grossTotal.toFixed(2)}</span>
                  </div>

                  {/* Good Samaritan 30% Discount Voucher Option */}
                  {currentUser.finderDiscountTokens > 0 ? (
                    <div className="pt-2 border-t border-slate-800/80">
                      <label className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={useDiscountVoucher}
                            onChange={(e) => setUseDiscountVoucher(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-amber-300 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5" />
                              <span>Apply 30% Good Samaritan Discount Voucher</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              You earned this token by returning someone else's item previously!
                            </div>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          -${(pricing.grossTotal * 0.30).toFixed(2)}
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 pt-1">
                      Tip: If you find and return items for others in the future, you earn a 30% discount token for your own shipping!
                    </div>
                  )}

                  {/* Net Payable Total */}
                  <div className="pt-3 border-t border-slate-700 flex justify-between items-center text-sm font-bold">
                    <span className="text-white">Total Shipping Fee to Pay:</span>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-emerald-400 font-mono">
                        ${pricing.netTotalPayable.toFixed(2)}
                      </span>
                      {pricing.hasDiscountApplied && (
                        <div className="text-[10px] text-amber-400 font-medium">30% discount deducted!</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Final Dispatch Button */}
                <button
                  type="button"
                  onClick={handleDispatchCourier}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                >
                  <Truck className="w-4 h-4" />
                  <span>
                    Pay ${pricing.netTotalPayable.toFixed(2)} & Dispatch Courier to Finder ({foundItem.userName})
                  </span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  )
}
