export type ItemType = 'lost' | 'found'

export type ItemCategory = 
  | 'smartphone'
  | 'earbuds'
  | 'laptop'
  | 'wallet'
  | 'keys'
  | 'smartwatch'
  | 'documents'
  | 'jewelry'
  | 'bag'
  | 'other'

export type ItemStatus = 
  | 'reported'
  | 'matched'
  | 'shipping_paid'
  | 'courier_assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'reunited'
  | 'resolved'


export interface Coordinates {
  lat: number
  lng: number
}

export interface Item {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  type: ItemType
  title: string
  category: ItemCategory
  brand?: string
  model?: string
  color?: string
  description: string
  photos: string[]
  locationAddress: string
  coordinates: Coordinates
  dateReported: string
  incidentDate: string
  // For lost item: where to ship if found
  shippingAddress?: string
  // Secret detail known only to owner (e.g., lock screen wallpaper, serial number snippet, inner pocket contents)
  secretVerificationHint?: string
  status: ItemStatus
  // Associated match or delivery ID
  matchedWithId?: string
  deliveryId?: string
  createdAt: string
}

export interface AIMatchResult {
  id: string
  lostItemId: string
  foundItemId: string
  confidenceScore: number // 0 to 100
  visualSimilarity: number
  textSimilarity: number
  locationProximityScore: number
  distanceKm: number
  aiRationale: string
  suggestedAction: 'high_confidence_match' | 'review_needed' | 'unlikely'
  status: 'pending' | 'owner_verified' | 'finder_confirmed' | 'shipping_arranged' | 'rejected'
  createdAt: string
}

export interface DeliveryPricing {
  distanceKm: number
  baseCourierPayout: number
  distanceRate: number
  highValueFee: number
  totalCourierPayout: number
  platformCommission: number // Website maintenance commission
  grossTotal: number
  discountAmount: number // 30% discount if finder token applied
  netTotalPayable: number
  hasDiscountApplied: boolean
}

export interface DeliveryJob {
  id: string
  matchId: string
  lostItemId: string
  foundItemId: string
  courierId?: string
  courierName?: string
  courierPhone?: string
  courierVehicle?: 'bicycle' | 'motorcycle' | 'car' | 'van'
  pickupAddress: string
  pickupCoords: Coordinates
  finderName: string
  finderPhone: string
  deliveryAddress: string
  deliveryCoords: Coordinates
  ownerName: string
  ownerPhone: string
  distanceKm: number
  courierPayout: number
  platformFee: number
  totalCharged: number
  discountApplied: number
  pickupOtp: string
  deliveryOtp: string
  status: 'available' | 'assigned' | 'en_route_pickup' | 'picked_up' | 'in_transit' | 'delivered'
  createdAt: string
  deliveredAt?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  password?: string
  role: 'lost_person' | 'finder_person' | 'courier' | 'admin' | 'user'
  finderDiscountTokens: number // Count of 30% discount tokens earned for returning found items
  itemsReportedLost: number
  itemsReportedFound: number
  successfulReunions: number
  courierWalletBalance?: number
  courierDeliveriesCompleted?: number
  courierRating?: number
  savedShippingAddress?: string
  // Security & KYC Identity Verification for Couriers & Users
  aadharNumber?: string
  aadharPhoto?: string
  facePhoto?: string
  faceMatchScore?: number // 0 - 100%
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected'
  vehicleType?: 'bicycle' | 'motorcycle' | 'car' | 'van'
  vehicleNumber?: string
  drivingLicense?: string
  verificationNotes?: string
  verifiedAt?: string
}

