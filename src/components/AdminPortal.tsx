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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-purple-50 border border-indigo-200/80 p-8 shadow-xs">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interface 4: Platform Super Admin Control Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            System Operations & Master Oversight
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            Centralized control plane for AI model neural matching, verified courier dispatching, platform commission accounting, and cross-interface privacy enforcement.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Running Neural Matrix...' : 'Run Global AI Matcher'}</span>
            </button>

            <button
              onClick={onOpenSupabaseModal}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase Cloud Status:</span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />
      </div>

      {/* Admin KPI Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-rose-600" />
            <span>Lost Reports</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalLost}</div>
          <div className="text-[10px] text-slate-400 font-medium">Active filings</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-emerald-600" />
            <span>Found Items</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalFound}</div>
          <div className="text-[10px] text-slate-400 font-medium">Safe in custody</div>
        </div>

        <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-purple-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Matches</span>
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">{matches.length}</div>
          <div className="text-[10px] text-purple-500 font-medium">Candidates paired</div>
        </div>

        <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Active Transits</span>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{activeTransits}</div>
          <div className="text-[10px] text-blue-500 font-medium">Couriers en route</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total Reunions</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{totalDelivered}</div>
          <div className="text-[10px] text-slate-400 font-medium">Delivered & verified</div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Platform Revenue</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">${totalPlatformRevenue.toFixed(2)}</div>
          <div className="text-[10px] text-slate-400 font-medium">Commission escrow</div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Operations Dashboard
        </button>

        <button
          onClick={() => setActiveTab('ai-matches')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'ai-matches'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Neural Matching Hub</span>
          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] flex items-center justify-center font-bold">
            {matches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('items-registry')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'items-registry'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Master Items Database ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('logistics')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'logistics'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fleet & Deliveries ({deliveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courier-kyc')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'courier-kyc'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Courier KYC Clearance</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>30% Voucher Ledger</span>
        </button>
      </div>

      {/* 1. OPERATIONS DASHBOARD TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Revenue Breakdown */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Platform Financial Accounting</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 font-medium">Couriers Earned & Disbursed:</div>
                  <div className="text-lg font-bold text-blue-600 mt-0.5">${totalCourierPayouts.toFixed(2)}</div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  Paid based on distance & fragile care
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 font-medium">Platform Infrastructure Fund:</div>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">${totalPlatformRevenue.toFixed(2)}</div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  Covers AI vision compute & server costs
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-amber-900 font-medium flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>Good Samaritan 30% Discounts Subsidized:</span>
                  </div>
                  <div className="text-lg font-bold text-amber-800 mt-0.5">-${totalDiscountsSubsidized.toFixed(2)}</div>
                </div>
                <div className="text-right text-[11px] text-amber-700">
                  Platform incentive subsidy
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Match Queue */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Pending AI Verification Queue ({matches.length})</span>
              </h2>
              <button
                onClick={() => setActiveTab('ai-matches')}
                className="text-xs text-purple-700 hover:text-purple-800 font-bold"
              >
                Inspect All →
              </button>
            </div>

            <div className="space-y-3">
              {matches.slice(0, 3).map(m => {
                const lost = items.find(i => i.id === m.lostItemId)
                const found = items.find(i => i.id === m.foundItemId)
                return (
                  <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-200">
                        {m.confidenceScore}%
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{lost?.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Matched with: {found?.title} ({m.distanceKm} km apart)
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMatch(m)
                        setActiveTab('ai-matches')
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-xs"
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
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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
                        ? 'bg-purple-50 border-purple-400 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        {m.confidenceScore}% Match
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{m.distanceKm} km apart</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-rose-700 font-bold uppercase">Lost Report:</div>
                        <div className="font-semibold text-slate-900 truncate">{lost?.title}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-emerald-700 font-bold uppercase">Found Report:</div>
                        <div className="font-semibold text-slate-900 truncate">{found?.title}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Deep Match Diagnostic Panel */}
          {selectedMatch && (
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {(() => {
                const lost = items.find(i => i.id === selectedMatch.lostItemId)
                const found = items.find(i => i.id === selectedMatch.foundItemId)
                if (!lost || !found) return null

                const pricing = calculateDeliveryPricing(selectedMatch.distanceKm, lost.category, true)

                return (
                  <>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <span>AI Neural Cross-Validation</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-bold">
                            {selectedMatch.confidenceScore}% Match
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Lost by: {lost.userName} | Found by: {found.userName}
                        </div>
                      </div>
                    </div>

                    {/* Side-by-side visual comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-rose-200 space-y-2">
                        <span className="text-[10px] font-bold text-rose-700 uppercase">Lost Item Photo</span>
                        <img src={lost.photos[0]} alt="Lost" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                        <div className="text-xs font-bold text-slate-900 truncate">{lost.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{lost.locationAddress}</div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-emerald-200 space-y-2">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Found Item Photo</span>
                        <img src={found.photos[0]} alt="Found" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                        <div className="text-xs font-bold text-slate-900 truncate">{found.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{found.locationAddress}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
                      <strong className="text-purple-800">AI Diagnostic Rationale: </strong>
                      {selectedMatch.aiRationale}
                    </div>

                    {/* Admin Force Dispatch Action */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          onConfirmMatchAndDispatchCourier(selectedMatch, lost, found, true)
                          confetti({ particleCount: 80, spread: 60 })
                        }}
                        className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, owner, address..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
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

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 flex items-center gap-2.5">
                      <img src={item.photos[0]} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{item.category}</div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        item.type === 'lost' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{item.userName}</div>
                      <div className="text-[10px] text-slate-500">{item.userPhone}</div>
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-[11px] text-slate-600">
                      {item.locationAddress}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-amber-800 font-mono max-w-xs truncate bg-amber-50/60 p-1 rounded">
                      {item.secretVerificationHint || 'N/A'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onUpdateItemStatus(item.id, 'reunited')}
                        title="Mark item as Reunited"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-xs"
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>Courier Deliveries & OTP Audit Center</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">{deliveries.length} Total Deliveries Logged</span>
          </div>

          {/* CLEAR GPS FLEET TRACKING MAP IN ADMIN LOGISTICS (Google Maps Look) */}
          <div className="rounded-2xl overflow-hidden border border-slate-300 bg-[#f4f3f0] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Admin Fleet Live Google Maps Radar Tracking</span>
              </div>
              <span className="text-[11px] text-slate-600 font-medium">
                {deliveries.filter(d => d.status === 'in_transit').length} Vehicles Currently in Motion
              </span>
            </div>

            <div 
              className="relative h-60 w-full rounded-xl overflow-hidden border border-slate-300"
              style={{ backgroundColor: '#f4f3f0' }}
            >
              <svg className="absolute inset-0 w-full h-full">
                {/* Park */}
                <rect x="260" y="40" width="140" height="120" rx="6" fill="#cbe6a3" />
                {/* River */}
                <path d="M 0,0 L 70,0 L 40,240 L 0,240 Z" fill="#aad3df" />
                {/* Roads */}
                <line x1="50" y1="100" x2="600" y2="100" stroke="#ffffff" strokeWidth="9" />
                <line x1="50" y1="180" x2="600" y2="180" stroke="#ffffff" strokeWidth="9" />
                <line x1="180" y1="0" x2="180" y2="240" stroke="#ffffff" strokeWidth="8" />
                <line x1="450" y1="0" x2="450" y2="240" stroke="#ffffff" strokeWidth="8" />

                {/* Google blue route lines */}
                <line x1="25%" y1="70%" x2="75%" y2="30%" stroke="#174ea6" strokeWidth="7" strokeLinecap="round" opacity="0.4" />
                <line x1="25%" y1="70%" x2="75%" y2="30%" stroke="#1a73e8" strokeWidth="5" strokeLinecap="round" />
                <line x1="25%" y1="70%" x2="75%" y2="30%" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="6 6" className="animate-pulse" />
              </svg>

              {/* Pin 1: Active In-Transit Courier Marco */}
              <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-9 h-9 rounded-2xl bg-[#1a73e8] text-white flex items-center justify-center font-bold shadow-lg border-2 border-white animate-bounce">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded bg-white text-[10px] text-blue-700 border border-blue-200 whitespace-nowrap font-bold shadow-xs">
                  Marco Silva (2.4 km • En Route)
                </span>
              </div>

              {/* Pin 2: Pickup Hotspot */}
              <div className="absolute left-[25%] top-[70%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
                <svg width="24" height="28" viewBox="0 0 24 32">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="#34a853" />
                  <circle cx="12" cy="11" r="5" fill="#ffffff" />
                  <text x="12" y="14" fill="#188038" fontSize="9" fontWeight="bold" textAnchor="middle">A</text>
                </svg>
                <span className="mt-0.5 px-1.5 py-0.5 rounded bg-white text-[9px] text-emerald-800 border border-emerald-200 font-bold shadow-xs">
                  Pickup: Columbus Circle
                </span>
              </div>

              {/* Pin 3: Delivery Hotspot */}
              <div className="absolute left-[75%] top-[30%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
                <svg width="24" height="28" viewBox="0 0 24 32">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="#ea4335" />
                  <circle cx="12" cy="11" r="5" fill="#ffffff" />
                  <text x="12" y="14" fill="#b31412" fontSize="9" fontWeight="bold" textAnchor="middle">B</text>
                </svg>
                <span className="mt-0.5 px-1.5 py-0.5 rounded bg-white text-[9px] text-rose-800 border border-rose-200 font-bold shadow-xs">
                  Dropoff: Evergreen Terrace
                </span>
              </div>

              <div className="absolute bottom-1 left-2 text-[9px] font-bold text-slate-500 font-sans">
                Google
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveries.map(del => (
              <div key={del.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Order #{del.id.slice(-6)}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    del.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    del.status === 'in_transit' ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {del.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-500">Pickup Finder:</div>
                    <div className="font-semibold text-slate-900">{del.finderName}</div>
                    <div className="text-[11px] text-emerald-700 font-mono font-bold mt-0.5">Pickup OTP: {del.pickupOtp}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Dropoff Owner:</div>
                    <div className="font-semibold text-slate-900">{del.ownerName}</div>
                    <div className="text-[11px] text-blue-700 font-mono font-bold mt-0.5">Delivery OTP: {del.deliveryOtp}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 text-slate-600">
                  <div>
                    <span>Driver Payout: </span>
                    <span className="font-bold text-blue-600">${del.courierPayout.toFixed(2)}</span>
                  </div>
                  <div>
                    <span>Platform Fee: </span>
                    <span className="font-bold text-emerald-700">${del.platformFee.toFixed(2)}</span>
                  </div>
                  <div>
                    <span>Distance: </span>
                    <span className="font-bold text-slate-900">{del.distanceKm} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. COURIER KYC & AADHAAR / BIOMETRIC CLEARANCE TAB */}
      {activeTab === 'courier-kyc' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>Delivery Partner Identity Clearance (Aadhaar & Biometric Face Match)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Admin authority to review government Aadhaar identity documents and neural facial cross-match before approving couriers to accept recovery jobs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold">
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
                      ? 'bg-white border-emerald-300 shadow-xs' 
                      : 'bg-white border-amber-300 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{courier.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          isVerifiedCourier ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          isPendingCourier ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse' :
                          'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {courier.verificationStatus || 'Pending Review'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{courier.email} • {courier.phone}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-500">Rating:</div>
                      <div className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        <span>{courier.courierRating || 5.0}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline" />
                      </div>
                    </div>
                  </div>

                  {/* Side-by-Side: Aadhaar Document vs Biometric Face Scan */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="text-[10px] font-bold text-blue-700 uppercase flex items-center justify-between">
                        <span>1. Aadhaar Card Scan</span>
                        <FileText className="w-3 h-3" />
                      </div>
                      <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <img 
                          src={courier.aadharPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'} 
                          alt="Aadhaar Document" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="text-[11px] font-mono font-bold text-slate-800 text-center">
                        UID: {courier.aadharNumber || '5849-2104-9938'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="text-[10px] font-bold text-purple-700 uppercase flex items-center justify-between">
                        <span>2. Live Face Selfie</span>
                        <Camera className="w-3 h-3" />
                      </div>
                      <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <img 
                          src={courier.facePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'} 
                          alt="Face Selfie" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="text-[11px] font-bold text-emerald-700 text-center">
                        Face Match: {courier.faceMatchScore || 98.4}% Match
                      </div>
                    </div>
                  </div>

                  {/* Vehicle details */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-500">Vehicle: </span>
                      <span className="font-bold text-slate-900 capitalize">{courier.vehicleType || 'Motorcycle'} ({courier.vehicleNumber || 'MH-02-CD-4921'})</span>
                    </div>
                    <div>
                      <span className="text-slate-500">License: </span>
                      <span className="font-mono text-slate-800 font-medium">{courier.drivingLicense || 'DL-9948210385'}</span>
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
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve Aadhaar & Grant Delivery License</span>
                      </button>
                    ) : (
                      <div className="w-full p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Courier Authorized & Permitted to Deliver</span>
                      </div>
                    )}

                    {!isVerifiedCourier && (
                      <button
                        type="button"
                        onClick={() => onRejectCourier && onRejectCourier(courier.id, 'Document blur or face mismatch')}
                        className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Good Samaritan 30% Discount Token Balance Ledger</span>
            </h2>
            <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-bold">
              30% Shipping Incentive Program
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Audit of all users who have found items and their current balance of 30% shipping discount vouchers:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {users.map(u => (
              <div key={u.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 capitalize">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{u.email}</div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500">30% Vouchers:</span>
                  <span className="font-bold text-amber-700 font-mono text-sm">
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
