import React from 'react'
import { 
  Sparkles, 
  MapPin, 
  Search, 
  Gift, 
  Truck, 
  Database, 
  Tag, 
  User, 
  CheckCircle2, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react'
import { UserProfile } from '../types'

interface NavbarProps {
  currentTab: 'lost' | 'found' | 'ai-matcher' | 'delivery' | 'map'
  onSelectTab: (tab: 'lost' | 'found' | 'ai-matcher' | 'delivery' | 'map') => void
  currentUser: UserProfile
  allUsers: UserProfile[]
  onSelectUser: (user: UserProfile) => void
  onOpenSupabaseModal: () => void
  isSupabaseLive: boolean
  matchCount: number
  availableJobsCount: number
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  allUsers,
  onSelectUser,
  onOpenSupabaseModal,
  isSupabaseLive,
  matchCount,
  availableJobsCount
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onSelectTab('lost')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                  Reunite<span className="text-indigo-400">AI</span>
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Lost & Found
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">AI Matching & Courier Recovery System</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => onSelectTab('lost')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'lost'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4 text-red-300" />
              <span>I Lost Something</span>
            </button>

            <button
              onClick={() => onSelectTab('found')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                currentTab === 'found'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Gift className="w-4 h-4 text-emerald-300" />
              <span>I Found Something</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 font-bold">
                30% Off Reward
              </span>
            </button>

            <button
              onClick={() => onSelectTab('ai-matcher')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                currentTab === 'ai-matcher'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI Match Hub</span>
              {matchCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-purple-500 text-white rounded-full">
                  {matchCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('delivery')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
                currentTab === 'delivery'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Truck className="w-4 h-4 text-cyan-300" />
              <span>Delivery Portal</span>
              {availableJobsCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-cyan-500 text-white rounded-full">
                  {availableJobsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('map')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'map'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>Live Map</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Supabase status pill */}
            <button
              onClick={onOpenSupabaseModal}
              title="Click to configure Supabase credentials & SQL schema"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Supabase</span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Finder Reward Tokens Counter Badge */}
            {currentUser.finderDiscountTokens > 0 && (
              <div 
                title={`${currentUser.finderDiscountTokens} voucher(s) available for 30% off your next lost item shipping charges!`}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold"
              >
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentUser.finderDiscountTokens}x 30% Off Voucher</span>
              </div>
            )}

            {/* User Profile Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-sm transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-xs leading-none text-slate-200">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                    {currentUser.role === 'courier' ? (
                      <span className="text-cyan-400">Delivery Partner</span>
                    ) : (
                      <span>{currentUser.finderDiscountTokens > 0 ? 'Good Samaritan' : 'Member'}</span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-800 mb-1">
                    Switch Test User Persona:
                  </div>
                  {allUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u)
                        setUserDropdownOpen(false)
                      }}
                      className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-colors ${
                        u.id === currentUser.id ? 'bg-indigo-950/60 border border-indigo-800/50' : 'hover:bg-slate-800'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 mt-0.5">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-slate-200 flex items-center justify-between">
                          <span className="truncate">{u.name}</span>
                          {u.id === currentUser.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                        </div>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {u.role === 'courier' ? '🛵 Courier Driver' : `User (${u.finderDiscountTokens} tokens)`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onSelectTab('lost')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentTab === 'lost' ? 'text-red-400 font-bold' : 'text-slate-400'}`}
          >
            <Search className="w-4 h-4 mb-0.5" />
            <span>Lost</span>
          </button>
          <button
            onClick={() => onSelectTab('found')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentTab === 'found' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            <Gift className="w-4 h-4 mb-0.5" />
            <span>Found</span>
          </button>
          <button
            onClick={() => onSelectTab('ai-matcher')}
            className={`flex flex-col items-center py-1 px-2 rounded relative ${currentTab === 'ai-matcher' ? 'text-purple-400 font-bold' : 'text-slate-400'}`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span>AI Radar</span>
            {matchCount > 0 && (
              <span className="absolute -top-1 right-1 w-4 h-4 bg-purple-500 text-white rounded-full text-[10px] flex items-center justify-center">
                {matchCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('delivery')}
            className={`flex flex-col items-center py-1 px-2 rounded relative ${currentTab === 'delivery' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
          >
            <Truck className="w-4 h-4 mb-0.5" />
            <span>Delivery</span>
            {availableJobsCount > 0 && (
              <span className="absolute -top-1 right-1 w-4 h-4 bg-cyan-500 text-white rounded-full text-[10px] flex items-center justify-center">
                {availableJobsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('map')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentTab === 'map' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            <MapPin className="w-4 h-4 mb-0.5" />
            <span>Map</span>
          </button>
        </div>

      </div>
    </header>
  )
}
