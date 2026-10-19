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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-white to-cyan-50 border border-blue-200/80 p-8 shadow-xs">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold uppercase tracking-wider mb-3">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Interface 3: Verified Delivery Partner Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Delivery Partner Hub & Secure Logistics
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            Strict biometric identity and Aadhaar verification ensures only trusted couriers handle valuable electronics and documents. Real-time GPS tracking and Dual-OTP verification protect both Finder and Owner.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {isVerified ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>KYC Identity Verified (Aadhaar & Face Recognition Approved)</span>
              </div>
            ) : isPending ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Verification In Review by Admin (Aadhaar & Face Scan Submitted)</span>
              </div>
            ) : (
              <button
                onClick={() => setShowKycModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Scan className="w-4 h-4" />
                <span>Complete Aadhaar & Face Recognition Verification</span>
              </button>
            )}

            <button
              onClick={() => setShowKycModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              View / Edit KYC Details
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />
      </div>

      {/* Courier KYC Security Modal */}
      {showKycModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Courier KYC & Identity Verification</h3>
                  <p className="text-xs text-slate-500">Aadhaar Card + Biometric Neural Face Match</p>
                </div>
              </div>
              <button 
                onClick={() => setShowKycModal(false)} 
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {kycSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{kycSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveKyc} className="space-y-4 text-xs">
              
              {/* Aadhaar Card Input */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Government Aadhaar Card Number (12 Digits)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">UIDAI Format</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  value={aadharInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    const formatted = val.match(/.{1,4}/g)?.join('-') || val
                    setAadharInput(formatted.slice(0, 14))
                  }}
                  placeholder="e.g. 5849-2104-9938"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm tracking-wider focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Aadhaar Document Preview */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
                    <img 
                      src={currentUser.aadharPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'} 
                      alt="Aadhaar Card Document" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Aadhaar Document Photo</div>
                    <div className="text-[10px] text-slate-500">Front scan with clear photo and DOB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAadharUploaded(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs"
                >
                  {aadharUploaded ? 'Uploaded ✓' : 'Upload Card'}
                </button>
              </div>

              {/* Biometric Face Recognition Viewfinder */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>AI Biometric Face Scan & Liveness Check</span>
                  </span>
                  {faceCaptured && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
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
                    <div className="text-center text-slate-400 space-y-1">
                      <Scan className="w-8 h-8 text-cyan-400/80 mx-auto" />
                      <div className="text-[11px]">Position your face in front of the camera</div>
                    </div>
                  )}

                  {/* Neural Oval Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-28 h-36 rounded-full border-2 ${
                      isFaceScanning ? 'border-cyan-400 animate-pulse' : faceCaptured ? 'border-emerald-400' : 'border-dashed border-slate-500'
                    }`} />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isFaceScanning}
                  onClick={handleSimulateFaceScan}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-300 shadow-xs"
                >
                  <Scan className={`w-3.5 h-3.5 ${isFaceScanning ? 'animate-spin' : ''}`} />
                  <span>{isFaceScanning ? 'Scanning Biometrics & Eye Align...' : 'Capture Face Verification Selfie'}</span>
                </button>
              </div>

              {/* Driving License & Vehicle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vehicle Reg. Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="MH-02-CD-4921"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Driving License Number</label>
                  <input
                    type="text"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    placeholder="DL-9948210385"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-colors"
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
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Courier Earnings</div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              ${(currentUser.courierWalletBalance || 245.50).toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Instant Payout on OTP Handover</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Deliveries Completed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-semibold text-slate-500">Deliveries Completed</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {currentUser.courierDeliveriesCompleted || 18} Trips
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">100% Verified OTPs</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Partner Rating */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-semibold text-slate-500">Partner Rating</div>
            <div className="text-2xl font-black text-amber-600 mt-1 flex items-center gap-1">
              <span>{currentUser.courierRating || 4.95}</span>
              <Star className="w-5 h-5 fill-amber-500 text-amber-500 inline" />
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Top Rated Logistics Partner</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-700 mb-1.5">Registered Vehicle:</div>
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
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
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
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{otpError}</span>
        </div>
      )}

      {/* ACTIVE DELIVERY IN TRANSIT WITH AUTHENTIC GOOGLE MAPS NAVIGATION */}
      {activeJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
              <span>Active Delivery in Progress</span>
            </h2>
            <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-bold">
              Order #{activeJobs[0].id.slice(-6)}
            </span>
          </div>

          {activeJobs.map(job => (
            <div 
              key={job.id}
              className="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-900"
            >
              {/* CLEAR GOOGLE MAPS TRANSIT ROUTE */}
              <div className="rounded-2xl overflow-hidden border border-slate-300 bg-[#f4f3f0] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>Google Maps Live Transit Route ({job.distanceKm} km)</span>
                  </div>
                  <span className="text-[11px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                    Est. Transit Time: 18 - 25 min
                  </span>
                </div>

                {/* Visual Route Canvas */}
                <div 
                  className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-300"
                  style={{ backgroundColor: '#f4f3f0' }}
                >
                  <svg className="absolute inset-0 w-full h-full">
                    {/* Central Park block */}
                    <rect x="250" y="30" width="120" height="90" rx="6" fill="#cbe6a3" />
                    {/* Water body */}
                    <path d="M 0,0 L 50,0 L 30,200 L 0,200 Z" fill="#aad3df" />
                    {/* Street network */}
                    <line x1="40" y1="90" x2="600" y2="90" stroke="#ffffff" strokeWidth="8" />
                    <line x1="40" y1="140" x2="600" y2="140" stroke="#ffffff" strokeWidth="8" />
                    <line x1="160" y1="0" x2="160" y2="200" stroke="#ffffff" strokeWidth="8" />
                    <line x1="420" y1="0" x2="420" y2="200" stroke="#ffffff" strokeWidth="8" />

                    {/* Google Blue Route Line */}
                    <line x1="20%" y1="65%" x2="80%" y2="35%" stroke="#174ea6" strokeWidth="7" strokeLinecap="round" opacity="0.4" />
                    <line x1="20%" y1="65%" x2="80%" y2="35%" stroke="#1a73e8" strokeWidth="5" strokeLinecap="round" />
                    <line x1="20%" y1="65%" x2="80%" y2="35%" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="6 6" className="animate-pulse" />
                  </svg>

                  {/* Marker A: Finder Pickup (Google Green Pin A) */}
                  <div className="absolute left-[20%] top-[65%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
                    <svg width="28" height="34" viewBox="0 0 24 32">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="#34a853" />
                      <circle cx="12" cy="11" r="5" fill="#ffffff" />
                      <text x="12" y="14" fill="#188038" fontSize="9" fontWeight="bold" textAnchor="middle">A</text>
                    </svg>
                    <span className="mt-1 px-2 py-0.5 rounded bg-white/90 border border-emerald-200 text-[10px] text-emerald-800 whitespace-nowrap font-bold shadow-xs">
                      Pickup: {job.finderName}
                    </span>
                  </div>

                  {/* Moving Courier Marker */}
                  <div className="absolute left-[52%] top-[49%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                    <div className="w-9 h-9 rounded-2xl bg-[#1a73e8] text-white flex items-center justify-center font-bold shadow-lg border-2 border-white">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded bg-white text-[10px] text-blue-700 border border-blue-200 whitespace-nowrap font-bold shadow-xs">
                      Courier In Transit
                    </span>
                  </div>

                  {/* Marker B: Owner Dropoff (Google Red Pin B) */}
                  <div className="absolute left-[80%] top-[35%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
                    <svg width="28" height="34" viewBox="0 0 24 32">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="#ea4335" />
                      <circle cx="12" cy="11" r="5" fill="#ffffff" />
                      <text x="12" y="14" fill="#b31412" fontSize="9" fontWeight="bold" textAnchor="middle">B</text>
                    </svg>
                    <span className="mt-1 px-2 py-0.5 rounded bg-white/90 border border-rose-200 text-[10px] text-rose-800 whitespace-nowrap font-bold shadow-xs">
                      Dropoff: {job.ownerName}
                    </span>
                  </div>

                  {/* Google watermark */}
                  <div className="absolute bottom-1 left-2 text-[9px] font-bold text-slate-500 font-sans">
                    Google
                  </div>
                </div>
              </div>

              {/* Two-Step Verification Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Step 1: Finder Pickup OTP */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Step 1: Collect Item From Finder
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{job.finderPhone}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{job.finderName}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{job.pickupAddress}</span>
                    </div>
                  </div>

                  {job.status === 'assigned' ? (
                    <div className="pt-2 space-y-2">
                      <div className="text-xs text-slate-600">
                        Ask finder for their 4-digit pickup OTP to verify item handoff:
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={enteredPickupOtp}
                          onChange={(e) => setEnteredPickupOtp(e.target.value)}
                          placeholder="e.g. 8492"
                          className="w-32 px-3 py-2 bg-white border border-emerald-500 rounded-xl text-center font-mono text-lg font-bold text-emerald-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyPickup(job)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Confirm Pickup</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        (Demo Code: <span className="font-mono text-emerald-700 font-bold">{job.pickupOtp}</span>)
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Item Picked Up via Verified OTP</span>
                    </div>
                  )}
                </div>

                {/* Step 2: Owner Delivery OTP */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      Step 2: Deliver to Owner
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{job.ownerPhone}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{job.ownerName}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{job.deliveryAddress}</span>
                    </div>
                  </div>

                  {job.status === 'in_transit' ? (
                    <div className="pt-2 space-y-2">
                      <div className="text-xs text-slate-600">
                        At owner's doorstep, enter their delivery OTP to release earnings:
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={enteredDeliveryOtp}
                          onChange={(e) => setEnteredDeliveryOtp(e.target.value)}
                          placeholder="e.g. 3175"
                          className="w-32 px-3 py-2 bg-white border border-blue-500 rounded-xl text-center font-mono text-lg font-bold text-blue-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyDelivery(job)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete & Collect ${job.courierPayout.toFixed(2)}</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        (Demo Code: <span className="font-mono text-blue-700 font-bold">{job.deliveryOtp}</span>)
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-medium">
                      Awaiting pickup from finder before dropoff unlocks.
                    </div>
                  )}
                </div>

              </div>

              {/* Earnings Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-500 block font-medium">Distance:</span>
                    <span className="font-bold text-slate-900 text-sm">{job.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Net Payout to Your Wallet:</span>
                    <span className="font-bold text-blue-600 text-base">${job.courierPayout.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Platform Maintenance Fee:</span>
                    <span className="font-bold text-slate-700 text-sm">${job.platformFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
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
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>Available Delivery Gigs ({availableJobs.length})</span>
          </h2>
          {!isVerified && (
            <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Aadhaar/Face Verification required to accept gigs</span>
            </span>
          )}
        </div>

        {availableJobs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">All Dispatched Deliveries Assigned</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              New deliveries appear automatically as soon as the Admin approves AI matches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableJobs.map(job => (
              <div 
                key={job.id}
                className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-3xl p-6 shadow-xs space-y-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    Order #{job.id.slice(-6)}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Driver Earnings:</div>
                    <div className="text-xl font-black text-blue-600">${job.courierPayout.toFixed(2)}</div>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-xs font-bold border border-emerald-200">
                      A
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Pickup (Finder: {job.finderName}):</div>
                      <div className="font-semibold text-slate-800">{job.pickupAddress}</div>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-slate-300 ml-3 h-4" />

                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 text-xs font-bold border border-blue-200">
                      B
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Delivery (Owner: {job.ownerName}):</div>
                      <div className="font-semibold text-slate-800">{job.deliveryAddress}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px] font-medium">Distance</div>
                    <div className="font-bold text-slate-900 mt-0.5">{job.distanceKm} km</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px] font-medium">Platform Fee</div>
                    <div className="font-bold text-slate-700 mt-0.5">${job.platformFee.toFixed(2)}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px] font-medium">Est. Time</div>
                    <div className="font-bold text-emerald-700 mt-0.5">25 - 35 min</div>
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
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
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
