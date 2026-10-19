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
  Star,
  Camera,
  FileText,
  Scan,
  ShieldAlert,
  UserCheck,
  Check,
  Upload
} from 'lucide-react'
import { DeliveryJob, UserProfile } from '../types'
import confetti from 'canvas-confetti'

interface DeliveryPortalProps {
  currentUser: UserProfile
  deliveries: DeliveryJob[]
  onAcceptJob: (jobId: string, courier: { id: string; name: string; phone: string; vehicle: 'bicycle' | 'motorcycle' | 'car' | 'van' }) => void
  onUpdateDeliveryStep: (jobId: string, nextStatus: DeliveryJob['status']) => void
  onCompleteDelivery: (jobId: string) => void
  onUpdateKyc?: (kycData: Partial<UserProfile>) => void
}

export const DeliveryPortal: React.FC<DeliveryPortalProps> = ({
  currentUser,
  deliveries,
  onAcceptJob,
  onUpdateDeliveryStep,
  onCompleteDelivery,
  onUpdateKyc
}) => {
  const [courierName] = useState(currentUser.name || 'Marco Silva')
  const [courierPhone] = useState(currentUser.phone || '+1 (555) 901-2345')
  const [vehicle, setVehicle] = useState<'bicycle' | 'motorcycle' | 'car' | 'van'>(currentUser.vehicleType || 'motorcycle')
  
  // KYC Form states
  const [showKycModal, setShowKycModal] = useState(false)
  const [aadharInput, setAadharInput] = useState(currentUser.aadharNumber || '')
  const [vehicleNumber, setVehicleNumber] = useState(currentUser.vehicleNumber || 'MH-02-CD-4921')
  const [drivingLicense, setDrivingLicense] = useState(currentUser.drivingLicense || 'DL-9948210385')
  const [isFaceScanning, setIsFaceScanning] = useState(false)
  const [faceCaptured, setFaceCaptured] = useState(Boolean(currentUser.facePhoto))
  const [aadharUploaded, setAadharUploaded] = useState(Boolean(currentUser.aadharPhoto))
  const [kycSuccess, setKycSuccess] = useState('')

  // OTP input states for active delivery verification
  const [enteredPickupOtp, setEnteredPickupOtp] = useState('')
  const [enteredDeliveryOtp, setEnteredDeliveryOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  const isVerified = currentUser.verificationStatus === 'verified'
  const isPending = currentUser.verificationStatus === 'pending'

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

  // Simulated biometric face scan
  const handleSimulateFaceScan = () => {
    setIsFaceScanning(true)
    setTimeout(() => {
      setIsFaceScanning(false)
      setFaceCaptured(true)
    }, 1500)
  }

  const handleSaveKyc = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aadharInput.trim()) {
      alert('Please enter your Aadhaar Card number')
      return
    }

    const updatedKyc: Partial<UserProfile> = {
      aadharNumber: aadharInput,
      aadharPhoto: currentUser.aadharPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
      facePhoto: currentUser.facePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      faceMatchScore: 98.4,
      verificationStatus: 'pending',
      vehicleType: vehicle,
      vehicleNumber,
      drivingLicense
    }

    if (onUpdateKyc) {
      onUpdateKyc(updatedKyc)
    }

    setKycSuccess('Aadhaar Card and Biometric Face Scan submitted to Admin for verification!')
    setTimeout(() => {
      setKycSuccess('')
      setShowKycModal(false)
    }, 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/70 border border-cyan-900/50 p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>Interface 3: Verified Delivery Partner Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Delivery Partner Hub & Secure Logistics
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Strict biometric identity and Aadhaar verification ensures only trusted couriers handle valuable electronics and documents. Real-time GPS tracking and Dual-OTP verification protect both Finder and Owner.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {isVerified ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>KYC Identity Verified (Aadhaar & Face Recognition Approved)</span>
              </div>
            ) : isPending ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-bold shadow-lg">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Verification In Review by Admin (Aadhaar & Face Scan Submitted)</span>
              </div>
            ) : (
              <button
                onClick={() => setShowKycModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-colors"
              >
                <Scan className="w-4 h-4" />
                <span>Complete Aadhaar & Face Recognition Verification</span>
              </button>
            )}

            <button
              onClick={() => setShowKycModal(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              View / Edit KYC Details
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Courier KYC Security Modal */}
      {showKycModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Courier KYC & Identity Verification</h3>
                  <p className="text-xs text-slate-400">Aadhaar Card + Biometric Neural Face Match</p>
                </div>
              </div>
              <button onClick={() => setShowKycModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {kycSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{kycSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveKyc} className="space-y-4 text-xs">
              
              {/* Aadhaar Card Input */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Government Aadhaar Card Number (12 Digits)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400">UIDAI Format</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  value={aadharInput}
                  onChange={(e) => {
                    // Auto-format XXXX-XXXX-XXXX
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    const formatted = val.match(/.{1,4}/g)?.join('-') || val
                    setAadharInput(formatted.slice(0, 14))
                  }}
                  placeholder="e.g. 5849-2104-9938"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm tracking-wider focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Aadhaar Document Preview */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                    <img 
                      src={currentUser.aadharPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'} 
                      alt="Aadhaar Card Document" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Aadhaar Document Photo</div>
                    <div className="text-[10px] text-slate-400">Front scan with clear photo and DOB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAadharUploaded(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                >
                  {aadharUploaded ? 'Uploaded ✓' : 'Upload Card'}
                </button>
              </div>

              {/* Biometric Face Recognition Viewfinder */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>AI Biometric Face Scan & Liveness Check</span>
                  </span>
                  {faceCaptured && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Match: 98.4% Confidence
                    </span>
                  )}
                </div>

                <div className="relative h-40 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {currentUser.facePhoto || faceCaptured ? (
                    <img 
                      src={currentUser.facePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'} 
                      alt="Face scan" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-center text-slate-500 space-y-1">
                      <Scan className="w-8 h-8 text-cyan-400/60 mx-auto" />
                      <div className="text-[11px]">Position your face in front of the camera</div>
                    </div>
                  )}

                  {/* Neural Oval Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-28 h-36 rounded-full border-2 ${
                      isFaceScanning ? 'border-cyan-400 animate-pulse' : faceCaptured ? 'border-emerald-400' : 'border-dashed border-slate-600'
                    }`} />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isFaceScanning}
                  onClick={handleSimulateFaceScan}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Scan className={`w-3.5 h-3.5 ${isFaceScanning ? 'animate-spin' : ''}`} />
                  <span>{isFaceScanning ? 'Scanning Biometrics & Eye Align...' : 'Capture Face Verification Selfie'}</span>
                </button>
              </div>

              {/* Driving License & Vehicle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle Reg. Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="MH-02-CD-4921"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Driving License Number</label>
                  <input
                    type="text"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    placeholder="DL-9948210385"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-cyan-950 transition-colors"
              >
                Submit Verification to Admin Portal
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Courier Stats Row */}
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
              <span>Instant Payout on OTP Handover</span>
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
            <div className="text-[11px] text-slate-400 mt-0.5">100% Verified OTPs</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Partner Rating */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-semibold text-slate-400">Partner Rating</div>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
              <span>{currentUser.courierRating || 4.95}</span>
              <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Top Rated Logistics Partner</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-400 mb-1.5">Registered Vehicle:</div>
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
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
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
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-200 flex items-center gap-2 text-sm shadow-xl">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{otpError}</span>
        </div>
      )}

      {/* ACTIVE DELIVERY IN TRANSIT WITH CLEAR INTERACTIVE GPS TRACKING MAP */}
      {activeJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <span>Active Delivery in Progress</span>
            </h2>
            <span className="text-xs text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800 font-semibold">
              Order #{activeJobs[0].id.slice(-6)}
            </span>
          </div>

          {activeJobs.map(job => (
            <div 
              key={job.id}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              {/* CLEAR INTERACTIVE GPS TRANSIT ROUTE MAP */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    <span>Live Transit Navigation Route ({job.distanceKm} km)</span>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    Est. Transit Time: 18 - 25 min
                  </span>
                </div>

                {/* Visual Route Canvas */}
                <div 
                  className="relative h-48 w-full rounded-xl bg-slate-900 border border-slate-800 overflow-hidden"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 70%),
                      linear-gradient(to right, #1e293b 1px, transparent 1px),
                      linear-gradient(to bottom, #1e293b 1px, transparent 1px)
                    `,
                    backgroundSize: '100% 100%, 25px 25px, 25px 25px'
                  }}
                >
                  <svg className="absolute inset-0 w-full h-full">
                    {/* Route line connecting A and B */}
                    <line x1="20%" y1="65%" x2="80%" y2="35%" stroke="#06b6d4" strokeWidth="4" strokeDasharray="6 4" className="animate-pulse" />
                  </svg>

                  {/* Marker A: Finder Pickup */}
                  <div className="absolute left-[20%] top-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-emerald-950 border-2 border-white">
                      A
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-slate-950/90 border border-emerald-500/40 text-[10px] text-emerald-300 whitespace-nowrap font-semibold">
                      Pickup: {job.finderName}
                    </span>
                  </div>

                  {/* Moving Courier Marker */}
                  <div className="absolute left-[52%] top-[49%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                    <div className="w-9 h-9 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-xl border-2 border-white">
                      <Truck className="w-5 h-5 text-slate-950" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-cyan-950 text-[10px] text-cyan-300 border border-cyan-800 whitespace-nowrap font-bold">
                      Courier In Transit
                    </span>
                  </div>

                  {/* Marker B: Owner Dropoff */}
                  <div className="absolute left-[80%] top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-blue-950 border-2 border-white">
                      B
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-slate-950/90 border border-blue-500/40 text-[10px] text-blue-300 whitespace-nowrap font-semibold">
                      Dropoff: {job.ownerName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pickup & Dropoff OTP Verification Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                
                {/* Step 1: Finder Pickup OTP */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                      Step 1: Pickup from Finder
                    </span>
                    <span className="text-xs text-slate-400">{job.finderPhone}</span>
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
                        Ask Finder for their secret 4-digit pickup code:
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
                          <span>Confirm Pickup</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        (Demo Code: <span className="font-mono text-emerald-400 font-bold">{job.pickupOtp}</span>)
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Item Picked Up via Verified OTP</span>
                    </div>
                  )}
                </div>

                {/* Step 2: Owner Delivery OTP */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800">
                      Step 2: Deliver to Owner
                    </span>
                    <span className="text-xs text-slate-400">{job.ownerPhone}</span>
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
                        At owner's doorstep, enter their delivery OTP to release earnings:
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
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete & Collect ${job.courierPayout.toFixed(2)}</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        (Demo Code: <span className="font-mono text-cyan-400 font-bold">{job.deliveryOtp}</span>)
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-medium">
                      Awaiting pickup from finder before dropoff unlocks.
                    </div>
                  )}
                </div>

              </div>

              {/* Earnings Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-400 block">Distance:</span>
                    <span className="font-bold text-white text-sm">{job.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Net Payout to Your Wallet:</span>
                    <span className="font-bold text-cyan-400 text-base">${job.courierPayout.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Platform Maintenance Fee:</span>
                    <span className="font-bold text-slate-300 text-sm">${job.platformFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  Escrow Guaranteed
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Available Gigs Marketplace */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            <span>Available Delivery Gigs ({availableJobs.length})</span>
          </h2>
          {!isVerified && (
            <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Aadhaar/Face Verification required to accept gigs</span>
            </span>
          )}
        </div>

        {availableJobs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-cyan-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">All Dispatched Deliveries Assigned</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              New deliveries appear automatically as soon as the Admin approves AI matches.
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

                <button
                  type="button"
                  disabled={!isVerified}
                  onClick={() => onAcceptJob(job.id, {
                    id: currentUser.id,
                    name: courierName,
                    phone: courierPhone,
                    vehicle
                  })}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isVerified 
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>
                    {isVerified 
                      ? `Accept Delivery Gig ($${job.courierPayout.toFixed(2)})`
                      : 'Aadhaar Verification Required to Accept'
                    }
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
