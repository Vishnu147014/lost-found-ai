import React, { useState } from 'react'
import { 
  Key, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  Search, 
  Gift, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import { UserProfile } from '../types'
import { authenticateUser, registerUser } from '../lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: UserProfile) => void
  allUsers: UserProfile[]
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  allUsers
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'lost_person' | 'finder_person' | 'courier'>('lost_person')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const user = authenticateUser(email, password)
    if (user) {
      onLoginSuccess(user)
      onClose()
    } else {
      setError('Invalid email or password. Please check your credentials or use the 1-Click test accounts.')
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name,
      email,
      phone: phone || '+1 (555) 000-1234',
      password,
      role,
      finderDiscountTokens: role === 'finder_person' ? 1 : 0,
      itemsReportedLost: 0,
      itemsReportedFound: 0,
      successfulReunions: 0,
      courierWalletBalance: role === 'courier' ? 0.0 : undefined,
      courierDeliveriesCompleted: role === 'courier' ? 0 : undefined,
      courierRating: role === 'courier' ? 5.0 : undefined,
      verificationStatus: role === 'courier' ? 'pending' : undefined
    }

    const saved = registerUser(newUser)
    setSuccessMsg('Account registered successfully! Logging you in...')
    setTimeout(() => {
      onLoginSuccess(saved)
      onClose()
    }, 800)
  }

  const handleQuickLogin = (user: UserProfile) => {
    onLoginSuccess(user)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {mode === 'login' ? 'Secure Portal Sign In' : 'Create New Account'}
              </h2>
              <p className="text-xs text-slate-400">Authenticated Role Access & KYC Verification</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* 1-Click Role Logins for Immediate Testing */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Instant Role-Based Quick Login:</span>
            <span className="text-[10px] text-emerald-400">Pre-Configured</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin(allUsers.find(u => u.role === 'lost_person') || allUsers[0])}
              className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/60 border border-slate-800 hover:border-red-500/50 text-left transition-colors flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <Search className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Lost Person</div>
                <div className="text-[10px] text-slate-400">Alex Johnson</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin(allUsers.find(u => u.role === 'finder_person') || allUsers[1])}
              className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 text-left transition-colors flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Gift className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Found Person</div>
                <div className="text-[10px] text-slate-400">Elena (30% Token)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin(allUsers.find(u => u.id === 'courier_marco') || allUsers[2])}
              className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 text-left transition-colors flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Delivery Agent</div>
                <div className="text-[10px] text-emerald-400">Aadhaar Verified</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin(allUsers.find(u => u.role === 'admin') || allUsers[3])}
              className="p-2 rounded-xl bg-slate-900 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/50 text-left transition-colors flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Super Admin</div>
                <div className="text-[10px] text-purple-300">Sarah Vance</div>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`pb-2.5 px-4 border-b-2 transition-colors ${
              mode === 'login' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Email Login
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`pb-2.5 px-4 border-b-2 transition-colors ${
              mode === 'register' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            New Registration
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex.j@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition-colors"
            >
              <Key className="w-4 h-4" />
              <span>Sign In to Account</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 789-0123"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Create Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Register As Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lost_person' as const, label: 'Lost Person' },
                  { id: 'finder_person' as const, label: 'Found Person' },
                  { id: 'courier' as const, label: 'Delivery Courier' },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`py-2 px-2 rounded-xl text-center font-bold border transition-colors ${
                      role === r.id
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {role === 'courier' && (
                <div className="text-[11px] text-cyan-400 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Courier registration requires Aadhaar Card and Biometric Face Recognition.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition-colors"
            >
              <span>Create Account & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
