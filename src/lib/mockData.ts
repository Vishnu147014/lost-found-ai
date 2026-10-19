import { Item, DeliveryJob, UserProfile } from '../types'

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_alex',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '+1 (555) 234-5678',
    role: 'user',
    finderDiscountTokens: 1, // Has 1 active 30% discount token from being a good Samaritan!
    itemsReportedLost: 2,
    itemsReportedFound: 1,
    successfulReunions: 1,
    savedShippingAddress: '742 Evergreen Terrace, Apt 4B, Springfield'
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    phone: '+1 (555) 876-5432',
    role: 'user',
    finderDiscountTokens: 2, // Has 2 discount vouchers
    itemsReportedLost: 0,
    itemsReportedFound: 3,
    successfulReunions: 2,
    savedShippingAddress: '120 West 44th Street, New York, NY 10036'
  },
  {
    id: 'courier_marco',
    name: 'Marco Silva',
    email: 'marco.courier@fastdrop.com',
    phone: '+1 (555) 901-2345',
    role: 'courier',
    finderDiscountTokens: 0,
    itemsReportedLost: 0,
    itemsReportedFound: 0,
    successfulReunions: 18,
    courierWalletBalance: 245.50,
    courierDeliveriesCompleted: 18,
    courierRating: 4.95
  }
]

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item_lost_1',
    userId: 'user_alex',
    userName: 'Alex Johnson',
    userEmail: 'alex.j@example.com',
    userPhone: '+1 (555) 234-5678',
    type: 'lost',
    title: 'Apple iPhone 15 Pro - Natural Titanium',
    category: 'smartphone',
    brand: 'Apple',
    model: 'iPhone 15 Pro (256GB)',
    color: 'Natural Titanium',
    description: 'Lost near Central Park South bench. It has a navy blue MagSafe silicone case with a small scratch on the bottom right corner. Lock screen shows a dog wallpaper.',
    photos: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80'
    ],
    locationAddress: 'Central Park South & 59th St, New York, NY 10019',
    coordinates: { lat: 40.7661, lng: -73.9772 },
    dateReported: '2026-10-18T10:30:00Z',
    incidentDate: '2026-10-18T09:15:00Z',
    shippingAddress: '742 Evergreen Terrace, Apt 4B, New York, NY 10023',
    secretVerificationHint: 'Lock screen wallpaper is a golden retriever named Buster; passcode ends in 89.',
    status: 'matched',
    matchedWithId: 'item_found_1',
    createdAt: '2026-10-18T10:30:00Z'
  },
  {
    id: 'item_found_1',
    userId: 'user_elena',
    userName: 'Elena Rostova',
    userEmail: 'elena.r@example.com',
    userPhone: '+1 (555) 876-5432',
    type: 'found',
    title: 'Found Apple iPhone in Navy Blue Case',
    category: 'smartphone',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    color: 'Titanium / Navy Blue Case',
    description: 'Found on a park bench near Columbus Circle fountain. Phone is fully charged, navy blue case with slight nick at the lower edge. Waiting for legitimate owner to claim.',
    photos: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80'
    ],
    locationAddress: 'Columbus Circle Park Plaza, New York, NY 10019',
    coordinates: { lat: 40.7681, lng: -73.9819 },
    dateReported: '2026-10-18T11:45:00Z',
    incidentDate: '2026-10-18T11:00:00Z',
    secretVerificationHint: 'Owner must verify lockscreen photo or unlock in courier presence.',
    status: 'matched',
    matchedWithId: 'item_lost_1',
    createdAt: '2026-10-18T11:45:00Z'
  },
  {
    id: 'item_lost_2',
    userId: 'user_sarah',
    userName: 'Sarah Chen',
    userEmail: 'sarah.c@example.com',
    userPhone: '+1 (555) 345-6789',
    type: 'lost',
    title: 'Apple AirPods Pro 2nd Gen in Matte Case',
    category: 'earbuds',
    brand: 'Apple',
    model: 'AirPods Pro 2',
    color: 'White',
    description: 'Left behind on the express downtown subway train (Line 1). White charging case with a green silicone carabiner attached.',
    photos: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80'
    ],
    locationAddress: '34th St - Herald Square Subway Station, New York, NY',
    coordinates: { lat: 40.7497, lng: -73.9878 },
    dateReported: '2026-10-19T08:00:00Z',
    incidentDate: '2026-10-19T07:30:00Z',
    shippingAddress: '450 Lexington Ave, Suite 1200, New York, NY 10017',
    secretVerificationHint: 'Bluetooth name is "Sarah\'s Pods 🎧". Left earbud has tiny smudge.',
    status: 'matched',
    matchedWithId: 'item_found_2',
    createdAt: '2026-10-19T08:00:00Z'
  },
  {
    id: 'item_found_2',
    userId: 'user_david',
    userName: 'David Miller',
    userEmail: 'david.m@example.com',
    userPhone: '+1 (555) 456-7890',
    type: 'found',
    title: 'AirPods Pro Case with Green Clip',
    category: 'earbuds',
    brand: 'Apple',
    model: 'AirPods Pro 2',
    color: 'White & Green',
    description: 'Picked up on bench near Subway Turnstile at Herald Square. Has green silicone sleeve and carabiner.',
    photos: [
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80'
    ],
    locationAddress: 'Herald Square Plaza, Broadway & 34th St, New York, NY',
    coordinates: { lat: 40.7501, lng: -73.9874 },
    dateReported: '2026-10-19T08:50:00Z',
    incidentDate: '2026-10-19T08:20:00Z',
    secretVerificationHint: 'Must provide device name registered on iCloud.',
    status: 'matched',
    matchedWithId: 'item_lost_2',
    createdAt: '2026-10-19T08:50:00Z'
  },
  {
    id: 'item_lost_3',
    userId: 'user_alex',
    userName: 'Alex Johnson',
    userEmail: 'alex.j@example.com',
    userPhone: '+1 (555) 234-5678',
    type: 'lost',
    title: 'Brown Leather Fossil Bifold Wallet',
    category: 'wallet',
    brand: 'Fossil',
    model: 'Derrick RFID Bifold',
    color: 'Dark Brown',
    description: 'Dark brown distressed leather wallet. Contains driver license with name Alex Johnson, metrocard, gym pass, and some cash.',
    photos: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'
    ],
    locationAddress: 'Bryant Park Reading Room, New York, NY 10018',
    coordinates: { lat: 40.7536, lng: -73.9832 },
    dateReported: '2026-10-19T11:15:00Z',
    incidentDate: '2026-10-19T10:45:00Z',
    shippingAddress: '742 Evergreen Terrace, Apt 4B, New York, NY 10023',
    secretVerificationHint: 'ID card inside matches my name: Alex Johnson.',
    status: 'reported',
    createdAt: '2026-10-19T11:15:00Z'
  }
]

export const INITIAL_DELIVERY_JOBS: DeliveryJob[] = [
  {
    id: 'del_job_1',
    matchId: 'match_item_lost_1_item_found_1',
    lostItemId: 'item_lost_1',
    foundItemId: 'item_found_1',
    courierId: 'courier_marco',
    courierName: 'Marco Silva',
    courierPhone: '+1 (555) 901-2345',
    courierVehicle: 'motorcycle',
    pickupAddress: 'Columbus Circle Park Plaza, New York, NY 10019',
    pickupCoords: { lat: 40.7681, lng: -73.9819 },
    finderName: 'Elena Rostova',
    finderPhone: '+1 (555) 876-5432',
    deliveryAddress: '742 Evergreen Terrace, Apt 4B, New York, NY 10023',
    deliveryCoords: { lat: 40.7735, lng: -73.9798 },
    ownerName: 'Alex Johnson',
    ownerPhone: '+1 (555) 234-5678',
    distanceKm: 2.4,
    courierPayout: 13.00, // $6 base + (2.4 * $1.25) + $4 high-value
    platformFee: 3.50,
    totalCharged: 16.50,
    discountApplied: 0,
    pickupOtp: '8492',
    deliveryOtp: '3175',
    status: 'in_transit',
    createdAt: '2026-10-18T13:00:00Z'
  },
  {
    id: 'del_job_2',
    matchId: 'match_item_lost_2_item_found_2',
    lostItemId: 'item_lost_2',
    foundItemId: 'item_found_2',
    pickupAddress: 'Herald Square Plaza, Broadway & 34th St, New York, NY',
    pickupCoords: { lat: 40.7501, lng: -73.9874 },
    finderName: 'David Miller',
    finderPhone: '+1 (555) 456-7890',
    deliveryAddress: '450 Lexington Ave, Suite 1200, New York, NY 10017',
    deliveryCoords: { lat: 40.7527, lng: -73.9748 },
    ownerName: 'Sarah Chen',
    ownerPhone: '+1 (555) 345-6789',
    distanceKm: 1.8,
    courierPayout: 8.25, // $6 base + (1.8 * $1.25)
    platformFee: 3.00,
    totalCharged: 7.87, // $11.25 - 30% discount = $7.87
    discountApplied: 3.38, // 30% discount applied!
    pickupOtp: '5621',
    deliveryOtp: '9043',
    status: 'available',
    createdAt: '2026-10-19T09:30:00Z'
  }
]
