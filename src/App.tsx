import React, { useState, useEffect } from 'react'
import { 
  Item, 
  DeliveryJob, 
  AIMatchResult, 
  UserProfile 
} from './types'
import { 
  fetchAllItems, 
  createItem, 
  fetchAllDeliveries, 
  createDeliveryJob, 
  updateDeliveryStatus, 
  updateItemStatus, 
  getLocalUsers, 
  saveLocalUsers, 
  creditCourierWallet, 
  rewardFinderWithDiscount, 
  isSupabaseConfigured,
  adminApproveCourier,
  adminRejectCourier,
  updateCourierKyc
} from './lib/supabase'
import { scanAndFindAllMatches } from './lib/aiMatcher'
import { calculateDeliveryPricing, calculateDistanceKm } from './lib/pricing'
import { Sidebar } from './components/Sidebar'
import { LostItemForm } from './components/LostItemForm'
import { FoundItemForm } from './components/FoundItemForm'
import { DeliveryPortal } from './components/DeliveryPortal'
import { AdminPortal } from './components/AdminPortal'
import { InteractiveMap } from './components/InteractiveMap'
import { SupabaseModal } from './components/SupabaseModal'
import { AuthModal } from './components/AuthModal'

export function App() {
  const [currentTab, setCurrentTab] = useState<'lost' | 'found' | 'delivery' | 'admin' | 'map'>('lost')
  
  // Data states
  const [items, setItems] = useState<Item[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryJob[]>([])
  const [matches, setMatches] = useState<AIMatchResult[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  
  // Supabase status & modal
  const [isSupabaseLive, setIsSupabaseLive] = useState(isSupabaseConfigured())
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false)
  
  // Authentication Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Notification toast state
  const [notification, setNotification] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'reward' } | null>(null)

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'reward' = 'success') => {
    setNotification({ title, desc, type })
    setTimeout(() => setNotification(null), 6000)
  }

  // Load initial data
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    const loadedUsers = getLocalUsers()
    setUsers(loadedUsers)
    if (!currentUser && loadedUsers.length > 0) {
      setCurrentUser(loadedUsers[0]) // Default to Alex Johnson (Lost Person)
    }

    const loadedItems = await fetchAllItems()
    setItems(loadedItems)

    const loadedDeliveries = await fetchAllDeliveries()
    setDeliveries(loadedDeliveries)

    // Compute AI Matches
    const detectedMatches = scanAndFindAllMatches(loadedItems)
    setMatches(detectedMatches)
  }

  // Auto re-scan matches when items change
  const handleTriggerReScan = () => {
    const freshMatches = scanAndFindAllMatches(items)
    setMatches(freshMatches)
    showToast('AI Neural Scan Complete', `Cross-referenced reports and identified ${freshMatches.length} candidate matches.`, 'info')
  }

  // 1. Submit Lost Item (Lost Person User)
  const handleSubmitLostItem = async (newItem: Item) => {
    const created = await createItem(newItem)
    const updatedItems = [created, ...items.filter(i => i.id !== created.id)]
    setItems(updatedItems)
    
    // Recompute AI matches
    const newMatches = scanAndFindAllMatches(updatedItems)
    setMatches(newMatches)

    // Update user stats
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        itemsReportedLost: (currentUser.itemsReportedLost || 0) + 1
      }
      setCurrentUser(updatedUser)
      const allUpdated = users.map(u => u.id === updatedUser.id ? updatedUser : u)
      setUsers(allUpdated)
      saveLocalUsers(allUpdated)
    }

    showToast(
      'Lost Item Registered!', 
      'Your item is stored securely with your encrypted verification clue. The AI radar is actively scanning found reports.', 
      'success'
    )
  }

  // 2. Submit Found Item (Finder Person User)
  const handleSubmitFoundItem = async (newItem: Item) => {
    const created = await createItem(newItem)
    const updatedItems = [created, ...items.filter(i => i.id !== created.id)]
    setItems(updatedItems)

    const newMatches = scanAndFindAllMatches(updatedItems)
    setMatches(newMatches)

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        itemsReportedFound: (currentUser.itemsReportedFound || 0) + 1
      }
      setCurrentUser(updatedUser)
      const allUpdated = users.map(u => u.id === updatedUser.id ? updatedUser : u)
      setUsers(allUpdated)
      saveLocalUsers(allUpdated)
    }

    showToast(
      'Found Item Safely Registered!', 
      'Thank you for being a Good Samaritan! When the owner receives this item, you will be rewarded with 30% off your next lost item shipping!', 
      'reward'
    )
  }

  // 3. Confirm Match and Dispatch Courier Pickup Job (Admin & System)
  const handleConfirmMatchAndDispatchCourier = async (
    match: AIMatchResult,
    lostItem: Item,
    foundItem: Item,
    applyDiscount: boolean
  ) => {
    const distanceKm = calculateDistanceKm(lostItem.coordinates, foundItem.coordinates)
    const pricing = calculateDeliveryPricing(distanceKm, lostItem.category, applyDiscount)

    // Generate random 4-digit verification OTPs for security
    const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString()
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString()

    const newJob: DeliveryJob = {
      id: `del_job_${Date.now()}`,
      matchId: match.id,
      lostItemId: lostItem.id,
      foundItemId: foundItem.id,
      pickupAddress: foundItem.locationAddress,
      pickupCoords: foundItem.coordinates,
      finderName: foundItem.userName,
      finderPhone: foundItem.userPhone,
      deliveryAddress: lostItem.shippingAddress || lostItem.locationAddress,
      deliveryCoords: lostItem.coordinates,
      ownerName: lostItem.userName,
      ownerPhone: lostItem.userPhone,
      distanceKm,
      courierPayout: pricing.totalCourierPayout,
      platformFee: pricing.platformCommission,
      totalCharged: pricing.netTotalPayable,
      discountApplied: pricing.discountAmount,
      pickupOtp,
      deliveryOtp,
      status: 'available',
      createdAt: new Date().toISOString()
    }

    await createDeliveryJob(newJob)
    setDeliveries(prev => [newJob, ...prev])

    // Update item statuses to 'courier_assigned'
    await updateItemStatus(lostItem.id, 'courier_assigned', foundItem.id)
    await updateItemStatus(foundItem.id, 'courier_assigned', lostItem.id)

    setItems(prev => prev.map(it => {
      if (it.id === lostItem.id || it.id === foundItem.id) {
        return { ...it, status: 'courier_assigned', matchedWithId: it.id === lostItem.id ? foundItem.id : lostItem.id }
      }
      return it
    }))

    // Deduct discount token if used
    if (applyDiscount && currentUser && currentUser.finderDiscountTokens > 0) {
      const updatedUser = {
        ...currentUser,
        finderDiscountTokens: currentUser.finderDiscountTokens - 1
      }
      setCurrentUser(updatedUser)
      const allUpdated = users.map(u => u.id === updatedUser.id ? updatedUser : u)
      setUsers(allUpdated)
      saveLocalUsers(allUpdated)
    }

    showToast(
      'Courier Dispatched!',
      `Shipping of $${pricing.netTotalPayable.toFixed(2)} arranged. Courier delivery job is now live!`,
      'success'
    )
  }

  // 4. Courier Accepts Gig (Delivery Agent)
  const handleAcceptJob = async (
    jobId: string, 
    courier: { id: string; name: string; phone: string; vehicle: 'bicycle' | 'motorcycle' | 'car' | 'van' }
  ) => {
    await updateDeliveryStatus(jobId, 'assigned', courier)
    const updated = await fetchAllDeliveries()
    setDeliveries(updated)

    showToast(
      'Delivery Gig Accepted!',
      `Navigate to Finder's location to collect the item. Ask for their 4-digit pickup OTP.`,
      'info'
    )
  }

  // 5. Update Delivery Step (OTP verified at pickup)
  const handleUpdateDeliveryStep = async (jobId: string, nextStatus: DeliveryJob['status']) => {
    await updateDeliveryStatus(jobId, nextStatus)
    const updated = await fetchAllDeliveries()
    setDeliveries(updated)

    // Also update associated items to in_transit
    const job = updated.find(j => j.id === jobId)
    if (job) {
      await updateItemStatus(job.lostItemId, 'in_transit')
      await updateItemStatus(job.foundItemId, 'in_transit')
      setItems(prev => prev.map(it => {
        if (it.id === job.lostItemId || it.id === job.foundItemId) {
          return { ...it, status: 'in_transit' }
        }
        return it
      }))
    }

    showToast('Pickup Confirmed via OTP!', 'Item is safely in transit to owner shipping address.', 'success')
  }

  // 6. Complete Delivery (OTP verified at owner dropoff)
  const handleCompleteDelivery = async (jobId: string) => {
    const job = deliveries.find(j => j.id === jobId)
    if (!job) return

    await updateDeliveryStatus(jobId, 'delivered')
    const updated = await fetchAllDeliveries()
    setDeliveries(updated)

    // Mark items as reunited / delivered
    await updateItemStatus(job.lostItemId, 'delivered')
    await updateItemStatus(job.foundItemId, 'delivered')
    setItems(prev => prev.map(it => {
      if (it.id === job.lostItemId || it.id === job.foundItemId) {
        return { ...it, status: 'delivered' }
      }
      return it
    }))

    // Credit courier wallet
    if (job.courierId) {
      creditCourierWallet(job.courierId, job.courierPayout)
    }

    // REWARD THE FINDER WITH A 30% SHIPPING DISCOUNT VOUCHER!
    rewardFinderWithDiscount(job.finderName)

    // Refresh users
    const refreshedUsers = getLocalUsers()
    setUsers(refreshedUsers)
    if (currentUser) {
      const self = refreshedUsers.find(u => u.id === currentUser.id)
      if (self) setCurrentUser(self)
    }

    showToast(
      'Delivery Handover Complete! 🎉',
      `Owner received item! Courier earned $${job.courierPayout.toFixed(2)}. Finder rewarded with 30% discount voucher!`,
      'reward'
    )
  }

  // Admin manual status override
  const handleAdminUpdateItemStatus = async (itemId: string, status: Item['status']) => {
    await updateItemStatus(itemId, status)
    const refreshed = await fetchAllItems()
    setItems(refreshed)
    showToast('Item Status Updated', `Item #${itemId.slice(-6)} set to ${status}.`, 'info')
  }

  // Admin Courier KYC Approvals
  const handleApproveCourier = (courierId: string) => {
    adminApproveCourier(courierId)
    const refreshed = getLocalUsers()
    setUsers(refreshed)
    if (currentUser && currentUser.id === courierId) {
      const self = refreshed.find(u => u.id === courierId)
      if (self) setCurrentUser(self)
    }
    showToast('Courier Approved!', 'Aadhaar Card and Biometric Face Scan authorized. Driver can now accept gigs.', 'success')
  }

  const handleRejectCourier = (courierId: string, reason?: string) => {
    adminRejectCourier(courierId, reason)
    const refreshed = getLocalUsers()
    setUsers(refreshed)
    if (currentUser && currentUser.id === courierId) {
      const self = refreshed.find(u => u.id === courierId)
      if (self) setCurrentUser(self)
    }
    showToast('Courier Authorization Rejected', reason || 'Identity documents flagged.', 'info')
  }

  const handleUpdateCourierKyc = (kycData: Partial<UserProfile>) => {
    if (!currentUser) return
    updateCourierKyc(currentUser.id, kycData)
    const refreshed = getLocalUsers()
    setUsers(refreshed)
    const self = refreshed.find(u => u.id === currentUser.id)
    if (self) setCurrentUser(self)
    showToast('KYC Submitted', 'Aadhaar & Biometric Face Scan sent to Admin for clearance.', 'info')
  }

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user)
    if (user.role === 'lost_person') setCurrentTab('lost')
    else if (user.role === 'finder_person') setCurrentTab('found')
    else if (user.role === 'courier') setCurrentTab('delivery')
    else if (user.role === 'admin') setCurrentTab('admin')
    showToast(`Welcome, ${user.name}!`, `Authenticated as ${user.role.replace('_', ' ').toUpperCase()}.`, 'success')
  }

  const availableJobsCount = deliveries.filter(d => d.status === 'available').length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Left-Side Navigation Bar */}
      {currentUser && (
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          currentUser={currentUser}
          allUsers={users}
          onSelectUser={(u) => setCurrentUser(u)}
          onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
          isSupabaseLive={isSupabaseLive}
          matchCount={matches.length}
          availableJobsCount={availableJobsCount}
        />
      )}

      {/* Main Content Area (offset by 72 on desktop to accommodate left sidebar) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen min-w-0">
        
        {/* Floating Notification Toast */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slide-up">
            <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
              notification.type === 'reward'
                ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                : notification.type === 'info'
                ? 'bg-indigo-950/90 border-indigo-500 text-indigo-200'
                : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
            }`}>
              <div className="text-xl shrink-0">
                {notification.type === 'reward' ? '🎁' : notification.type === 'info' ? '🧠' : '✨'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white">{notification.title}</div>
                <div className="text-xs opacity-90 mt-0.5 leading-relaxed">{notification.desc}</div>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="text-xs opacity-60 hover:opacity-100 text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Dynamic View by Tab */}
        <main className="flex-1 pb-16">
          {currentUser && (
            <>
              {/* 1. Lost Person Interface */}
              {currentTab === 'lost' && (
                <LostItemForm
                  currentUser={currentUser}
                  items={items}
                  onSubmitLostItem={handleSubmitLostItem}
                  onNavigateToMatch={(itemId) => setCurrentTab('admin')}
                />
              )}

              {/* 2. Found Person Interface */}
              {currentTab === 'found' && (
                <FoundItemForm
                  currentUser={currentUser}
                  items={items}
                  onSubmitFoundItem={handleSubmitFoundItem}
                  onNavigateToMatch={(itemId) => setCurrentTab('admin')}
                />
              )}

              {/* 3. Delivery Agent Interface */}
              {currentTab === 'delivery' && (
                <DeliveryPortal
                  currentUser={currentUser}
                  deliveries={deliveries}
                  onAcceptJob={handleAcceptJob}
                  onUpdateDeliveryStep={handleUpdateDeliveryStep}
                  onCompleteDelivery={handleCompleteDelivery}
                  onUpdateKyc={handleUpdateCourierKyc}
                />
              )}

              {/* 4. Admin Master Portal */}
              {currentTab === 'admin' && (
                <AdminPortal
                  items={items}
                  matches={matches}
                  deliveries={deliveries}
                  users={users}
                  onTriggerReScan={handleTriggerReScan}
                  onConfirmMatchAndDispatchCourier={handleConfirmMatchAndDispatchCourier}
                  onUpdateItemStatus={handleAdminUpdateItemStatus}
                  onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
                  isSupabaseLive={isSupabaseLive}
                  onApproveCourier={handleApproveCourier}
                  onRejectCourier={handleRejectCourier}
                />
              )}

              {/* 5. Live Geospatial Radar */}
              {currentTab === 'map' && (
                <InteractiveMap
                  items={items}
                  deliveries={deliveries}
                  onSelectItem={(item) => {
                    if (item.type === 'lost') setCurrentTab('lost')
                    else setCurrentTab('found')
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 text-slate-500 text-xs py-6 px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">ReuniteAI</span>
              <span>— 4-Role Architecture: Lost Person • Finder • Courier • Admin</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button 
                onClick={() => setSupabaseModalOpen(true)}
                className="hover:text-emerald-400 transition-colors"
              >
                Supabase PostgreSQL Schema
              </button>
              <span>•</span>
              <span>Aadhaar & Face Recognition Verified</span>
              <span>•</span>
              <span>Dual OTP Verified Handoff</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Supabase Configuration Modal */}
      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        onConfigSaved={() => {
          setIsSupabaseLive(isSupabaseConfigured())
          loadAllData()
        }}
      />

      {/* Authentication & Role Login Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        allUsers={users}
      />

    </div>
  )
}

export default App
