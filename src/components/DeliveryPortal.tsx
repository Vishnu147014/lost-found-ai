import React, { useState } from 'react'
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Navigation, 
  ShieldCheck, 
  CheckCircle2, 
  Key, 
  Smartphone, 
  Bike, 
  Car, 
  ArrowRight, 
  Clock, 
  Phone, 
  AlertCircle,
  Sparkles,
  Wallet,
  Star
} from 'lucide-react'
import { DeliveryJob, UserProfile } from '../types'
import confetti from 'canvas-confetti'

interface DeliveryPortalProps {
  currentUser: UserProfile
  deliveries: DeliveryJob[]
  onAcceptJob: (jobId: string, courier: { id: string; name: string; phone: string; vehicle: 'bicycle' | 'motorcycle' | 'car' | 'van' }) => void
  onUpdateDeliveryStep: (jobId: string, nextStatus: DeliveryJob['status']) => void
  onCompleteDelivery: (jobId: string) => void
}

export const DeliveryPortal: React.FC<DeliveryPortalProps> = ({
  currentUser,
  deliveries,
  onAcceptJob,
  onUpdateDeliveryStep,
  onCompleteDelivery
}) => {
  const [courierName, setCourierName] = useState(currentUser.name || 'Marco Silva')
  const [courierPhone, setCourierPhone] = useState(currentUser.phone || '+1 (555) 901-2345')
  const [vehicle, setVehicle] = useState<'bicycle' | 'motorcycle' | 'car' | 'van'>('motorcycle')
  
  // OTP input states for active delivery verification
  const [enteredPickupOtp, setEnteredPickupOtp] = useState('')
  const [enteredDeliveryOtp, setEnteredDeliveryOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  // Filter jobs
  const availableJobs = deliveries.filter(d => d.status === 'available')
  const activeJobs = deliveries.filter(d => 
    d.status === 'assigned' || d.status === 'en_route_pickup' || d.status === 'picked_up' || d.status === 'in_transit'
  )
  const completedJobs = deliveries.filter(d => d.status === 'delivered')

  const handleVerifyPickup = (job: DeliveryJob) => {
    if (enteredPickupOtp.trim() === job.pickupOtp) {
      setOtpError('')
      onUpdateDeliveryStep(job.id, 'in_transit')
      setEnteredPickupOtp('')
    } else {
      setOtpError(`Incorrect Pickup OTP. Please ask the Finder for the 4-digit code (${job.pickupOtp}).`)
    }
  }

  const handleVerifyDelivery = (job: DeliveryJob) => {
    if (enteredDeliveryOtp.trim() === job.deliveryOtp) {
      setOtpError('')
      onCompleteDelivery(job.id)
      setEnteredDeliveryOtp('')
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      })
    } else {
      setOtpError(`Incorrect Delivery OTP. Please ask the Owner for their 4-digit code (${job.deliveryOtp}).`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/70 border border-cyan-900/50 p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>Interface 3: Delivery Partner Registration & Live Courier Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Earn by Delivering Found Valuables
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Register as a verified delivery partner. Pickup matched lost items from the finder and safely transport them to the owner. Get paid transparently based on distance, item value, and prompt service with OTP-verified handoffs.
          </p>
        </div>

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Courier Stats & Registration Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Wallet Balance */}
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-semibold text-slate-400">Total Courier Earnings</div>
            <div className="text-2xl font-black text-cyan-400 mt-1">
              ${(currentUser.courierWalletBalance || 245.50).toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3" />
              <span>Instant Payouts on OTP Handoff</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Deliveries Completed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-semibold text-slate-400">Deliveries Completed</div>
            <div className="text-2xl font-black text-white mt-1">
              {currentUser.courierDeliveriesCompleted || 18} Trips
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">100% on-time rate</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Courier Rating */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-semibold text-slate-400">Partner Rating</div>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
              <span>{currentUser.courierRating || 4.95}</span>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Top Rated Courier</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Vehicle Type Selection */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-400 mb-1.5">My Delivery Vehicle:</div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'bicycle', label: 'Bike', icon: <Bike className="w-4 h-4" /> },
              { id: 'motorcycle', label: 'Motor', icon: <Truck className="w-4 h-4" /> },
              { id: 'car', label: 'Car', icon: <Car className="w-4 h-4" /> },
              { id: 'van', label: 'Van', icon: <Truck className="w-4 h-4" /> },
            ].map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVehicle(v.id as any)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold border transition-colors ${
                  vehicle === v.id
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-900/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {v.icon}
                <span className="mt-1">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {otpError && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-200 flex items-center gap-2 text-sm shadow-xl animate-shake">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{otpError}</span>
        </div>
      )}

      {/* Active Jobs in Progress */}
      {activeJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <span>Active Delivery in Progress</span>
            </h2>
            <span className="text-xs text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800 font-semibold">
              Live Order #{activeJobs[0].id.slice(-6)}
            </span>
          </div>

          {activeJobs.map(job => (
            <div 
              key={job.id}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              {/* Pickup & Dropoff Route Map visual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-800">
                
                {/* Pickup details (Finder) */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                      Step 1: Pickup from Finder
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {job.finderPhone}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{job.finderName}</div>
                    <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{job.pickupAddress}</span>
                    </div>
                  </div>

                  {job.status === 'assigned' || job.status === 'en_route_pickup' ? (
                    <div className="pt-2 space-y-2">
                      <div className="text-xs text-slate-400">
                        Ask the Finder for their secret 4-digit pickup code to confirm physical custody handoff:
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={enteredPickupOtp}
                          onChange={(e) => setEnteredPickupOtp(e.target.value)}
                          placeholder="e.g. 8492"
                          className="w-32 px-3 py-2 bg-slate-900 border border-emerald-500/60 rounded-xl text-center font-mono text-lg font-bold text-emerald-300 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyPickup(job)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Confirm Pickup & Start Transit</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        (Demo Hint: Finder's OTP is <span className="font-mono text-emerald-400 font-bold">{job.pickupOtp}</span>)
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Item Picked Up Safely & In Transit</span>
                    </div>
                  )}
                </div>

                {/* Delivery details (Owner) */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 relative space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800">
                      Step 2: Deliver to Owner
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-cyan-400" />
                      {job.ownerPhone}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{job.ownerName}</div>
                    <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{job.deliveryAddress}</span>
                    </div>
                  </div>

                  {job.status === 'in_transit' ? (
                    <div className="pt-2 space-y-2">
                      <div className="text-xs text-slate-400">
                        At owner's door, ask for their 4-digit delivery confirmation OTP to complete dropoff:
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={enteredDeliveryOtp}
                          onChange={(e) => setEnteredDeliveryOtp(e.target.value)}
                          placeholder="e.g. 3175"
                          className="w-32 px-3 py-2 bg-slate-900 border border-cyan-500/60 rounded-xl text-center font-mono text-lg font-bold text-cyan-300 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyDelivery(job)}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-900/50 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete & Collect ${job.courierPayout.toFixed(2)}</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        (Demo Hint: Owner's OTP is <span className="font-mono text-cyan-400 font-bold">{job.deliveryOtp}</span>)
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-medium">
                      Awaiting pickup from finder before delivery can unlock.
                    </div>
                  )}
                </div>

              </div>

              {/* Courier Earnings Breakdown Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-400 block">Trip Distance:</span>
                    <span className="font-bold text-white text-sm">{job.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Your Net Courier Payout:</span>
                    <span className="font-bold text-cyan-400 text-base">${job.courierPayout.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Platform Fee:</span>
                    <span className="font-bold text-slate-300 text-sm">${job.platformFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    Escrow Protected Payment
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Available Delivery Orders Marketplace */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            <span>Available Delivery Gigs ({availableJobs.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Refreshed live from AI Match verified orders</span>
        </div>

        {availableJobs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-cyan-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">All Active Items Dispatched!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no new unassigned recovery deliveries. Go to the <strong>AI Match Hub</strong> to confirm matches and dispatch new courier pickups.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableJobs.map(job => (
              <div 
                key={job.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    Order #{job.id.slice(-6)}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Driver Earnings:</div>
                    <div className="text-xl font-extrabold text-cyan-400">${job.courierPayout.toFixed(2)}</div>
                  </div>
                </div>

                {/* Pickup and Dropoff stops */}
                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-bold">
                      A
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Pickup (Finder: {job.finderName}):</div>
                      <div className="font-semibold text-slate-200">{job.pickupAddress}</div>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-slate-800 ml-3 h-4" />

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 text-xs font-bold">
                      B
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Delivery (Owner: {job.ownerName}):</div>
                      <div className="font-semibold text-slate-200">{job.deliveryAddress}</div>
                    </div>
                  </div>
                </div>

                {/* Pricing & Distance Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Distance</div>
                    <div className="font-bold text-white mt-0.5">{job.distanceKm} km</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Platform Fee</div>
                    <div className="font-bold text-slate-300 mt-0.5">${job.platformFee.toFixed(2)}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">Est. Time</div>
                    <div className="font-bold text-emerald-400 mt-0.5">25 - 35 min</div>
                  </div>
                </div>

                {job.discountApplied > 0 && (
                  <div className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center justify-between">
                    <span>Good Samaritan 30% Discount Applied for Owner!</span>
                    <span className="font-bold">-${job.discountApplied.toFixed(2)}</span>
                  </div>
                )}

                {/* Accept Job Action Button */}
                <button
                  type="button"
                  onClick={() => onAcceptJob(job.id, {
                    id: currentUser.id,
                    name: courierName,
                    phone: courierPhone,
                    vehicle
                  })}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40 transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  <span>Accept Delivery Gig (${job.courierPayout.toFixed(2)})</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Deliveries History */}
      {completedJobs.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Recently Completed Deliveries ({completedJobs.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {completedJobs.map(job => (
              <div key={job.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Order #{job.id.slice(-6)}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                      Delivered
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {job.pickupAddress.slice(0, 25)}... → {job.deliveryAddress.slice(0, 25)}...
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">+${job.courierPayout.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500">{job.distanceKm} km</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
