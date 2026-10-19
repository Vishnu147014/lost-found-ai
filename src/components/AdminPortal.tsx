import React, { useState } from 'react'
import { 
  ShieldAlert, 
  Sparkles, 
  Database, 
  Truck, 
  Package, 
  Gift, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Tag, 
  Users, 
  Search, 
  Eye, 
  ShieldCheck, 
  Key, 
  MapPin, 
  Sliders, 
  Trash2, 
  ArrowRight,
  TrendingUp,
  Percent,
  UserCheck,
  Star,
  FileText,
  Camera,
  Navigation
} from 'lucide-react'
import { AIMatchResult, DeliveryJob, Item, UserProfile } from '../types'
import { calculateDeliveryPricing, calculateDistanceKm } from '../lib/pricing'
import confetti from 'canvas-confetti'

interface AdminPortalProps {
  items: Item[]
  matches: AIMatchResult[]
  deliveries: DeliveryJob[]
  users: UserProfile[]
  onTriggerReScan: () => void
  onConfirmMatchAndDispatchCourier: (
    match: AIMatchResult, 
    lostItem: Item, 
    foundItem: Item, 
    applyDiscount: boolean
  ) => void
  onUpdateItemStatus: (itemId: string, status: Item['status']) => void
  onOpenSupabaseModal: () => void
  isSupabaseLive: boolean
  onApproveCourier?: (courierId: string) => void
  onRejectCourier?: (courierId: string, reason?: string) => void
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  items,
  matches,
  deliveries,
  users,
  onTriggerReScan,
  onConfirmMatchAndDispatchCourier,
  onUpdateItemStatus,
  onOpenSupabaseModal,
  isSupabaseLive,
  onApproveCourier,
  onRejectCourier
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-matches' | 'items-registry' | 'logistics' | 'courier-kyc' | 'security'>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const [isScanning, setIsScanning] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<AIMatchResult | null>(matches[0] || null)

  // System Financials & Operational Statistics
  const totalLost = items.filter(i => i.type === 'lost').length
  const totalFound = items.filter(i => i.type === 'found').length
  const totalDelivered = deliveries.filter(d => d.status === 'delivered').length
  const activeTransits = deliveries.filter(d => d.status === 'in_transit' || d.status === 'assigned').length
  const totalPlatformRevenue = deliveries.reduce((acc, d) => acc + (d.platformFee || 0), 0)
  const totalCourierPayouts = deliveries.reduce((acc, d) => acc + (d.courierPayout || 0), 0)
  const totalDiscountsSubsidized = deliveries.reduce((acc, d) => acc + (d.discountApplied || 0), 0)

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      onTriggerReScan()
      setIsScanning(false)
    }, 800)
  }

  // Filter items in registry
  const filteredItems = items.filter(it => {
    const matchesSearch = it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.locationAddress.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat = categoryFilter === 'all' || it.type === categoryFilter || it.category === categoryFilter
    return matchesSearch && matchesCat
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Master Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-purple-950/90 border border-indigo-500/30 p-8 shadow-2xl">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interface 4: Platform Super Admin Control Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            System Operations & Master Oversight
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Centralized control plane for AI model neural matching, verified courier dispatching, platform commission accounting, and cross-interface privacy enforcement.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-950 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Running Neural Matrix...' : 'Run Global AI Matcher'}</span>
            </button>

            <button
              onClick={onOpenSupabaseModal}
              className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase Cloud Status:</span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Admin KPI Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-red-400" />
            <span>Lost Reports</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{totalLost}</div>
          <div className="text-[10px] text-slate-500">Active owner filings</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Gift className="w-3.5 h-3.5 text-emerald-400" />
            <span>Found Items</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{totalFound}</div>
          <div className="text-[10px] text-slate-500">Safe in custody</div>
        </div>

        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Matches</span>
          </div>
          <div className="text-2xl font-black text-purple-400 mt-1">{matches.length}</div>
          <div className="text-[10px] text-purple-300/80">Candidates paired</div>
        </div>

        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Transits</span>
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{activeTransits}</div>
          <div className="text-[10px] text-cyan-300/80">Couriers en route</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Reunions</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{totalDelivered}</div>
          <div className="text-[10px] text-slate-500">Delivered & verified</div>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Platform Revenue</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">${totalPlatformRevenue.toFixed(2)}</div>
          <div className="text-[10px] text-slate-500">Maintenance commission</div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Operations Dashboard
        </button>

        <button
          onClick={() => setActiveTab('ai-matches')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors relative ${
            activeTab === 'ai-matches'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>AI Neural Matching Hub</span>
          <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center font-bold">
            {matches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('items-registry')}
          className={`px-4 py-2 rounded-xl transition-colors ${
            activeTab === 'items-registry'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          Master Items Database ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('logistics')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
            activeTab === 'logistics'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Truck className="w-4 h-4 text-cyan-300" />
          <span>Fleet & Deliveries ({deliveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courier-kyc')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors relative ${
            activeTab === 'courier-kyc'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-300" />
          <span>Courier KYC & Aadhaar ({users.filter(u => u.role === 'courier').length})</span>
          {users.filter(u => u.role === 'courier' && u.verificationStatus === 'pending').length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-black">
              {users.filter(u => u.role === 'courier' && u.verificationStatus === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
            activeTab === 'security'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-300" />
          <span>Good Samaritan Ledger</span>
        </button>
      </div>


      {/* 1. OPERATIONS DASHBOARD TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Financial Breakdown Card */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Platform Commission & Courier Split Ledger</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              When an item match is confirmed, the shipping charges are distributed between the delivery driver and the platform maintenance fund.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 font-medium">Driver Earnings Disbursed:</div>
                  <div className="text-lg font-bold text-cyan-400 mt-0.5">${totalCourierPayouts.toFixed(2)}</div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  Paid based on distance & fragile care
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 font-medium">Platform Infrastructure Fund:</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">${totalPlatformRevenue.toFixed(2)}</div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  Covers AI vision compute & server costs
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-amber-300 font-medium flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Good Samaritan 30% Discounts Subsidized:</span>
                  </div>
                  <div className="text-lg font-bold text-amber-300 mt-0.5">-${totalDiscountsSubsidized.toFixed(2)}</div>
                </div>
                <div className="text-right text-[11px] text-amber-400/80">
                  Platform incentive subsidy
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Match Queue */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Pending AI Verification Queue ({matches.length})</span>
              </h2>
              <button
                onClick={() => setActiveTab('ai-matches')}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                Inspect All →
              </button>
            </div>

            <div className="space-y-3">
              {matches.slice(0, 3).map(m => {
                const lost = items.find(i => i.id === m.lostItemId)
                const found = items.find(i => i.id === m.foundItemId)
                return (
                  <div key={m.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/30">
                        {m.confidenceScore}%
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{lost?.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Matched with: {found?.title} ({m.distanceKm} km apart)
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMatch(m)
                        setActiveTab('ai-matches')
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
                    >
                      Verify
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}

      {/* 2. AI MATCHES TAB */}
      {activeTab === 'ai-matches' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              AI Candidate Pairs ({matches.length})
            </h2>

            <div className="space-y-3">
              {matches.map(m => {
                const lost = items.find(i => i.id === m.lostItemId)
                const found = items.find(i => i.id === m.foundItemId)
                const isSelected = selectedMatch?.id === m.id

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMatch(m)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-xl'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                        {m.confidenceScore}% Match
                      </span>
                      <span className="text-xs text-slate-400">{m.distanceKm} km apart</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-red-400 font-bold uppercase">Lost Report:</div>
                        <div className="font-semibold text-slate-200 truncate">{lost?.title}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-emerald-400 font-bold uppercase">Found Report:</div>
                        <div className="font-semibold text-slate-200 truncate">{found?.title}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Deep Match Diagnostic Panel */}
          {selectedMatch && (
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {(() => {
                const lost = items.find(i => i.id === selectedMatch.lostItemId)
                const found = items.find(i => i.id === selectedMatch.foundItemId)
                if (!lost || !found) return null

                const pricing = calculateDeliveryPricing(selectedMatch.distanceKm, lost.category, true)

                return (
                  <>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div>
                        <div className="text-lg font-bold text-white flex items-center gap-2">
                          <span>AI Neural Cross-Validation</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                            {selectedMatch.confidenceScore}% Match
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Lost by: {lost.userName} | Found by: {found.userName}
                        </div>
                      </div>
                    </div>

                    {/* Side-by-side visual comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-950 rounded-2xl border border-red-950/60 space-y-2">
                        <span className="text-[10px] font-bold text-red-400 uppercase">Lost Item Photo</span>
                        <img src={lost.photos[0]} alt="Lost" className="w-full h-36 object-cover rounded-xl" />
                        <div className="text-xs font-bold text-slate-100 truncate">{lost.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{lost.locationAddress}</div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-2xl border border-emerald-950/60 space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Found Item Photo</span>
                        <img src={found.photos[0]} alt="Found" className="w-full h-36 object-cover rounded-xl" />
                        <div className="text-xs font-bold text-slate-100 truncate">{found.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{found.locationAddress}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-purple-300">AI Diagnostic Rationale: </strong>
                      {selectedMatch.aiRationale}
                    </div>

                    {/* Admin Force Dispatch Action */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          onConfirmMatchAndDispatchCourier(selectedMatch, lost, found, true)
                          confetti({ particleCount: 80, spread: 60 })
                        }}
                        className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition-colors"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Admin Override: Approve Match & Post Courier Delivery Gig (${pricing.totalCourierPayout.toFixed(2)})</span>
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          )}

        </div>
      )}

      {/* 3. MASTER ITEMS REGISTRY TAB */}
      {activeTab === 'items-registry' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, owner, address..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="all">All Items ({items.length})</option>
                <option value="lost">Lost Only ({totalLost})</option>
                <option value="found">Found Only ({totalFound})</option>
                <option value="smartphone">Smartphones</option>
                <option value="earbuds">Earbuds</option>
                <option value="wallet">Wallets</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Item</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Reported By</th>
                  <th className="p-3.5">Address Location</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Secret Clue (Admin)</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 flex items-center gap-2.5">
                      <img src={item.photos[0]} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" />
                      <div>
                        <div className="font-bold text-white">{item.title}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{item.category}</div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        item.type === 'lost' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{item.userName}</div>
                      <div className="text-[10px] text-slate-500">{item.userPhone}</div>
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-[11px] text-slate-400">
                      {item.locationAddress}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-amber-300/80 font-mono max-w-xs truncate">
                      {item.secretVerificationHint || 'N/A'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onUpdateItemStatus(item.id, 'reunited')}
                        title="Mark item as Reunited"
                        className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                      >
                        Reunite
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. LOGISTICS & FLEET TAB */}
      {activeTab === 'logistics' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-400" />
              <span>Courier Deliveries & OTP Audit Center</span>
            </h2>
            <span className="text-xs text-slate-400">{deliveries.length} Total Deliveries Logged</span>
          </div>

          {/* CLEAR GPS FLEET TRACKING MAP IN ADMIN LOGISTICS */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Admin Fleet Live GPS Radar Tracking</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {deliveries.filter(d => d.status === 'in_transit').length} Vehicles Currently in Motion
              </span>
            </div>

            <div 
              className="relative h-56 w-full rounded-xl bg-slate-900 border border-slate-800 overflow-hidden"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 80%),
                  linear-gradient(to right, #1e293b 1px, transparent 1px),
                  linear-gradient(to bottom, #1e293b 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 30px 30px, 30px 30px'
              }}
            >
              <svg className="absolute inset-0 w-full h-full">
                <line x1="25%" y1="70%" x2="75%" y2="30%" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
                <line x1="30%" y1="20%" x2="70%" y2="80%" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
              </svg>

              {/* Pin 1: Active In-Transit Courier Marco */}
              <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-9 h-9 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-xl border-2 border-white animate-bounce">
                  <Truck className="w-5 h-5 text-slate-950" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded bg-slate-950 text-[10px] text-cyan-300 border border-cyan-800 whitespace-nowrap font-bold">
                  Marco Silva (2.4 km • En Route)
                </span>
              </div>

              {/* Pin 2: Pickup Hotspot */}
              <div className="absolute left-[25%] top-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs border border-white">
                  A
                </div>
                <span className="mt-0.5 px-1.5 py-0.5 rounded bg-slate-950 text-[9px] text-emerald-300">
                  Pickup: Columbus Circle
                </span>
              </div>

              {/* Pin 3: Delivery Hotspot */}
              <div className="absolute left-[75%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs border border-white">
                  B
                </div>
                <span className="mt-0.5 px-1.5 py-0.5 rounded bg-slate-950 text-[9px] text-blue-300">
                  Dropoff: Evergreen Terrace
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveries.map(del => (
              <div key={del.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">Order #{del.id.slice(-6)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    del.status === 'delivered' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    del.status === 'in_transit' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {del.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-3 rounded-xl">
                  <div>
                    <div className="text-[10px] text-slate-500">Pickup Finder:</div>
                    <div className="font-semibold text-slate-200">{del.finderName}</div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5">Pickup OTP: {del.pickupOtp}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Dropoff Owner:</div>
                    <div className="font-semibold text-slate-200">{del.ownerName}</div>
                    <div className="text-[11px] text-cyan-400 font-mono mt-0.5">Delivery OTP: {del.deliveryOtp}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="text-slate-400">Driver Payout: </span>
                    <span className="font-bold text-cyan-400">${del.courierPayout.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Platform Fee: </span>
                    <span className="font-bold text-emerald-400">${del.platformFee.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Distance: </span>
                    <span className="font-bold text-white">{del.distanceKm} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. COURIER KYC & AADHAAR / BIOMETRIC CLEARANCE TAB */}
      {activeTab === 'courier-kyc' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <span>Delivery Partner Identity Clearance (Aadhaar & Biometric Face Match)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Admin authority to review government Aadhaar identity documents and neural facial cross-match before approving couriers to accept recovery jobs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-bold">
                {users.filter(u => u.role === 'courier' && u.verificationStatus === 'verified').length} Authorized Couriers
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {users.filter(u => u.role === 'courier').map(courier => {
              const isVerifiedCourier = courier.verificationStatus === 'verified'
              const isPendingCourier = courier.verificationStatus === 'pending'

              return (
                <div 
                  key={courier.id}
                  className={`p-6 rounded-3xl border space-y-4 ${
                    isVerifiedCourier 
                      ? 'bg-slate-950 border-emerald-500/40' 
                      : 'bg-slate-950 border-amber-500/50 shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{courier.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          isVerifiedCourier ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          isPendingCourier ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' :
                          'bg-red-950 text-red-300 border border-red-800'
                        }`}>
                          {courier.verificationStatus || 'Pending Review'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{courier.email} • {courier.phone}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400">Rating:</div>
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <span>{courier.courierRating || 5.0}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 inline" />
                      </div>
                    </div>
                  </div>

                  {/* Side-by-Side: Aadhaar Document vs Biometric Face Scan */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                      <div className="text-[10px] font-bold text-cyan-400 uppercase flex items-center justify-between">
                        <span>1. Aadhaar Card Scan</span>
                        <FileText className="w-3 h-3" />
                      </div>
                      <div className="h-28 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                        <img 
                          src={courier.aadharPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'} 
                          alt="Aadhaar Document" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="text-[11px] font-mono font-bold text-slate-300 text-center">
                        UID: {courier.aadharNumber || '5849-2104-9938'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                      <div className="text-[10px] font-bold text-purple-400 uppercase flex items-center justify-between">
                        <span>2. Live Face Selfie</span>
                        <Camera className="w-3 h-3" />
                      </div>
                      <div className="h-28 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                        <img 
                          src={courier.facePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'} 
                          alt="Face Selfie" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="text-[11px] font-bold text-emerald-400 text-center">
                        Face Match: {courier.faceMatchScore || 98.4}% Match
                      </div>
                    </div>
                  </div>

                  {/* Vehicle details */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400">Vehicle: </span>
                      <span className="font-bold text-white capitalize">{courier.vehicleType || 'Motorcycle'} ({courier.vehicleNumber || 'MH-02-CD-4921'})</span>
                    </div>
                    <div>
                      <span className="text-slate-400">License: </span>
                      <span className="font-mono text-slate-200">{courier.drivingLicense || 'DL-9948210385'}</span>
                    </div>
                  </div>

                  {/* Admin Clearance Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    {!isVerifiedCourier ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (onApproveCourier) onApproveCourier(courier.id)
                          confetti({ particleCount: 70, spread: 50 })
                        }}
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve Aadhaar & Grant Delivery License</span>
                      </button>
                    ) : (
                      <div className="w-full p-2 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Courier Authorized & Permitted to Deliver</span>
                      </div>
                    )}

                    {!isVerifiedCourier && (
                      <button
                        type="button"
                        onClick={() => onRejectCourier && onRejectCourier(courier.id, 'Document blur or face mismatch')}
                        className="py-2.5 px-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-xl text-xs font-semibold"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 6. GOOD SAMARITAN REWARDS LEDGER TAB */}

      {activeTab === 'security' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Good Samaritan 30% Discount Token Balance Ledger</span>
            </h2>
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 font-bold">
              30% Shipping Incentive Program
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Audit of all users who have found items and their current balance of 30% shipping discount vouchers:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {users.map(u => (
              <div key={u.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">{u.name}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{u.email}</div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">30% Vouchers:</span>
                  <span className="font-bold text-amber-400 font-mono text-sm">
                    {u.finderDiscountTokens || 0} Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
