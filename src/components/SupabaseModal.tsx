import React, { useState } from 'react'
import { 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Link, 
  ShieldCheck,
  Server
} from 'lucide-react'
import { getSavedSupabaseConfig, isSupabaseConfigured, saveSupabaseConfig } from '../lib/supabase'

interface SupabaseModalProps {
  isOpen: boolean
  onClose: () => void
  onConfigSaved: () => void
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const currentConfig = getSavedSupabaseConfig()
  const [url, setUrl] = useState(currentConfig.url)
  const [key, setKey] = useState(currentConfig.key)
  const [copied, setCopied] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  if (!isOpen) return null

  const handleSave = () => {
    saveSupabaseConfig(url, key)
    setTestStatus('success')
    setTestMessage('Supabase credentials successfully saved to app config!')
    onConfigSaved()
  }

  const handleCopySchema = () => {
    const sqlContent = `-- Run in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  color TEXT,
  description TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  location_address TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  date_reported TIMESTAMPTZ DEFAULT NOW(),
  incident_date TIMESTAMPTZ NOT NULL,
  shipping_address TEXT,
  secret_verification_hint TEXT,
  status TEXT DEFAULT 'reported',
  matched_with_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deliveries (
  id TEXT PRIMARY KEY,
  match_id TEXT,
  lost_item_id TEXT NOT NULL,
  found_item_id TEXT NOT NULL,
  courier_id TEXT,
  courier_name TEXT,
  courier_phone TEXT,
  courier_vehicle TEXT,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  distance_km NUMERIC(8, 2) NOT NULL,
  courier_payout NUMERIC(8, 2) NOT NULL,
  platform_fee NUMERIC(8, 2) NOT NULL,
  total_charged NUMERIC(8, 2) NOT NULL,
  discount_applied NUMERIC(8, 2) DEFAULT 0.00,
  pickup_otp TEXT NOT NULL,
  delivery_otp TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Public insert items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update items" ON public.items FOR UPDATE USING (true);
CREATE POLICY "Public read deliveries" ON public.deliveries FOR SELECT USING (true);
CREATE POLICY "Public insert deliveries" ON public.deliveries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update deliveries" ON public.deliveries FOR UPDATE USING (true);
`
    navigator.clipboard.writeText(sqlContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const isLive = isSupabaseConfigured()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Supabase Backend & Database</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                  isLive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {isLive ? 'Live Connected' : 'Mock / Local Storage Mode'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">PostgreSQL Cloud Database & Realtime Storage Setup</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Status Callout */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Dual-Mode Architecture:</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            The website is engineered with a dual-mode persistence architecture: it works 100% out-of-the-box using browser state & local storage. When you enter your Supabase URL & Key below, it automatically synchronizes with your cloud PostgreSQL tables.
          </p>
        </div>

        {/* Credentials Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-indigo-600" />
              <span>Project URL (`VITE_SUPABASE_URL`)</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span>Anon Public API Key (`VITE_SUPABASE_ANON_KEY`)</span>
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {testMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Save & Connect Supabase</span>
            </button>
          </div>
        </div>

        {/* Copy SQL Schema Section */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>One-Click PostgreSQL SQL Schema</span>
            </span>
            <button
              type="button"
              onClick={handleCopySchema}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 max-h-32 overflow-y-auto">
            <pre>
{`-- Run in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.items ( ... );
CREATE TABLE IF NOT EXISTS public.deliveries ( ... );
CREATE TABLE IF NOT EXISTS public.matches ( ... );
-- Complete schema file also saved at supabase-schema.sql`}
            </pre>
          </div>
          <div className="text-[11px] text-slate-500">
            A full production schema with RLS and indexes is also saved in your project root at <code className="text-emerald-700 font-bold">supabase-schema.sql</code>.
          </div>
        </div>

      </div>
    </div>
  )
}
