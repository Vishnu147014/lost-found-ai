import React, { useState } from 'react'
import { 
  Sparkles, 
  Search, 
  Gift, 
  Truck, 
  ShieldAlert, 
  MapPin, 
  Database, 
  Tag, 
  ChevronDown, 
  CheckCircle2, 
  Menu, 
  X,
  UserCheck,
  ShieldCheck,
  Package,
  Layers
} from 'lucide-react'
import { UserProfile } from '../types'

interface SidebarProps {
  currentTab: 'lost' | 'found' | 'delivery' | 'admin' | 'map'
  onSelectTab: (tab: 'lost' | 'found' | 'delivery' | 'admin' | 'map') => void
  currentUser: UserProfile
  allUsers: UserProfile[]
  onSelectUser: (user: UserProfile) => void
  onOpenSupabaseModal: () => void
  isSupabaseLive: boolean
  matchCount: number
  availableJobsCount: number
}

export const Sidebar: React.FC<SidebarProps> = ({
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const navItems = [
    {
      id: 'lost' as const,
      label: 'Lost Person Portal',
      subtitle: 'Upload Item & Loss Address',
      icon: <Search className="w-5 h-5" />,
      color: 'red',
      activeClass: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-950/50',
      badge: null
    },
    {
      id: 'found' as const,
      label: 'Found Person Portal',
      subtitle: 'Upload Found & Custody Details',
      icon: <Gift className="w-5 h-5" />,
      color: 'emerald',
      activeClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50',
      badge: '30% Reward'
    },
    {
      id: 'delivery' as const,
      label: 'Delivery Agent Portal',
      subtitle: 'Pickup, OTP Transit & Earnings',
      icon: <Truck className="w-5 h-5" />,
      color: 'cyan',
      activeClass: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50',
      badge: availableJobsCount > 0 ? `${availableJobsCount} Gigs` : null
    },
    {
      id: 'admin' as const,
      label: 'Admin Master Portal',
      subtitle: 'AI Matching & Fleet Oversight',
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'purple',
      activeClass: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-950/50',
      badge: matchCount > 0 ? `${matchCount} Matches` : null
    },
    {
      id: 'map' as const,
      label: 'Live Geospatial Radar',
      subtitle: 'Real-Time Map Coordinates',
      icon: <MapPin className="w-5 h-5" />,
      color: 'blue',
      activeClass: 'bg-slate-800 text-white border border-slate-700 shadow-md',
      badge: null
    }
  ]

  // Automatically sync active persona with role
  const handleSelectRolePersona = (user: UserProfile) => {
    onSelectUser(user)
    setUserDropdownOpen(false)
    if (user.role === 'lost_person') onSelectTab('lost')
    else if (user.role === 'finder_person') onSelectTab('found')
    else if (user.role === 'courier') onSelectTab('delivery')
    else if (user.role === 'admin') onSelectTab('admin')
  }

  return (
    <>
      {/* Mobile Top Header with Hamburger */}
      <div className="lg:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg text-white">Reunite<span className="text-indigo-400">AI</span></span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Left-Side Navigation Bar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between
        transition-transform duration-300 ease-in-out select-none
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top Branding */}
        <div>
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-indigo-500/20">
                <Sparkles className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white">
                    Reunite<span className="text-indigo-400">AI</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">4-Role Secure System</p>
              </div>
            </div>

            {/* Quick Role Persona Switcher Pill */}
            <div className="mt-4 relative">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Active User Persona</span>
                <span className="text-emerald-400">Role Isolated</span>
              </div>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {currentUser.role.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {userDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold px-2 py-1">Switch Persona & Interface:</div>
                  {allUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectRolePersona(u)}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                        u.id === currentUser.id ? 'bg-indigo-950 border border-indigo-800 text-white' : 'hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs">{u.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{u.role.replace('_', ' ')}</div>
                      </div>
                      {u.id === currentUser.id && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Vertical Navigation Menu Options */}
          <div className="p-3 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Dedicated Interfaces
            </div>

            {navItems.map(item => {
              const isSelected = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id)
                    setMobileOpen(false)
                  }}
                  className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all group ${
                    isSelected
                      ? item.activeClass
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate leading-tight">{item.label}</div>
                      <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? 'bg-black/30 text-white'
                        : item.color === 'emerald'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom Section: Supabase Cloud & Samaritan Voucher */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          
          {/* Finder 30% discount token status */}
          {currentUser.finderDiscountTokens > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-[11px]">Good Samaritan Perk</span>
              </div>
              <span className="font-bold text-xs bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/40">
                {currentUser.finderDiscountTokens}x 30% Off
              </span>
            </div>
          )}

          {/* Supabase status button */}
          <button
            onClick={onOpenSupabaseModal}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Supabase Cloud</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isSupabaseLive ? 'Connected' : 'Local Mode'}</span>
            </div>
          </button>

          <div className="text-[10px] text-slate-500 text-center">
            ReuniteAI v2.0 • Role Secured
          </div>
        </div>

      </aside>
    </>
  )
}
