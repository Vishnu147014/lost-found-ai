import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Item, DeliveryJob, UserProfile } from '../types'
import { INITIAL_DELIVERY_JOBS, INITIAL_ITEMS, INITIAL_USERS } from './mockData'

const envUrl = import.meta.env.VITE_SUPABASE_URL || ''
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Let user configure Supabase dynamically via UI settings modal as well
export function getSavedSupabaseConfig(): { url: string; key: string } {
  const storedUrl = localStorage.getItem('supabase_custom_url') || ''
  const storedKey = localStorage.getItem('supabase_custom_key') || ''
  return {
    url: storedUrl || envUrl,
    key: storedKey || envKey
  }
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem('supabase_custom_url', url.trim())
  localStorage.setItem('supabase_custom_key', key.trim())
  // Re-instantiate client
  initClient()
}

let supabaseInstance: SupabaseClient | null = null

function initClient(): SupabaseClient | null {
  const { url, key } = getSavedSupabaseConfig()
  if (url && key && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, key)
      return supabaseInstance
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e)
      supabaseInstance = null
    }
  }
  supabaseInstance = null
  return null
}

initClient()

export function isSupabaseConfigured(): boolean {
  return supabaseInstance !== null
}

export function getSupabase(): SupabaseClient | null {
  return supabaseInstance
}

// ----------------------------------------------------
// LOCAL STORAGE PERSISTENCE LAYER (Zero config fallback)
// ----------------------------------------------------

const ITEMS_STORAGE_KEY = 'reunite_ai_items_v2'
const DELIVERIES_STORAGE_KEY = 'reunite_ai_deliveries_v2'
const USERS_STORAGE_KEY = 'reunite_ai_users_v2'

export function getLocalItems(): Item[] {
  try {
    const data = localStorage.getItem(ITEMS_STORAGE_KEY)
    if (!data) {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(INITIAL_ITEMS))
      return INITIAL_ITEMS
    }
    return JSON.parse(data)
  } catch {
    return INITIAL_ITEMS
  }
}

export function saveLocalItems(items: Item[]): void {
  localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items))
}

export function getLocalDeliveries(): DeliveryJob[] {
  try {
    const data = localStorage.getItem(DELIVERIES_STORAGE_KEY)
    if (!data) {
      localStorage.setItem(DELIVERIES_STORAGE_KEY, JSON.stringify(INITIAL_DELIVERY_JOBS))
      return INITIAL_DELIVERY_JOBS
    }
    return JSON.parse(data)
  } catch {
    return INITIAL_DELIVERY_JOBS
  }
}

export function saveLocalDeliveries(deliveries: DeliveryJob[]): void {
  localStorage.setItem(DELIVERIES_STORAGE_KEY, JSON.stringify(deliveries))
}

export function getLocalUsers(): UserProfile[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY)
    if (!data) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS))
      return INITIAL_USERS
    }
    const parsed: UserProfile[] = JSON.parse(data)
    // Merge any missing initial users (such as courier_rahul or admin_sarah)
    const existingMap = new Map(parsed.map(u => [u.id, u]))
    let modified = false
    for (const initUser of INITIAL_USERS) {
      if (!existingMap.has(initUser.id)) {
        parsed.push(initUser)
        modified = true
      } else {
        // Upgrade existing with security fields if missing
        const current = existingMap.get(initUser.id)!
        if (!current.verificationStatus && initUser.verificationStatus) {
          Object.assign(current, initUser)
          modified = true
        }
      }
    }
    if (modified) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed))
    }
    return parsed
  } catch {
    return INITIAL_USERS
  }
}


export function saveLocalUsers(users: UserProfile[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

// ----------------------------------------------------
// UNIFIED DATA ACCESS API (Works with Supabase or Local)
// ----------------------------------------------------

export async function fetchAllItems(): Promise<Item[]> {
  const client = getSupabase()
  if (client) {
    try {
      const { data, error } = await client.from('items').select('*').order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          userId: row.user_id,
          userName: row.user_name || 'Anonymous User',
          userEmail: row.user_email || '',
          userPhone: row.user_phone || '',
          type: row.type,
          title: row.title,
          category: row.category,
          brand: row.brand,
          model: row.model,
          color: row.color,
          description: row.description,
          photos: Array.isArray(row.photos) ? row.photos : [],
          locationAddress: row.location_address,
          coordinates: { lat: Number(row.latitude), lng: Number(row.longitude) },
          dateReported: row.date_reported || row.created_at,
          incidentDate: row.incident_date || row.created_at,
          shippingAddress: row.shipping_address,
          secretVerificationHint: row.secret_verification_hint,
          status: row.status,
          matchedWithId: row.matched_with_id,
          deliveryId: row.delivery_id,
          createdAt: row.created_at
        }))
      }
    } catch (e) {
      console.warn('Falling back to local data due to Supabase error:', e)
    }
  }
  return getLocalItems()
}

export async function createItem(item: Item): Promise<Item> {
  const client = getSupabase()
  if (client) {
    try {
      const { error } = await client.from('items').insert({
        id: item.id,
        user_id: item.userId,
        user_name: item.userName,
        user_email: item.userEmail,
        user_phone: item.userPhone,
        type: item.type,
        title: item.title,
        category: item.category,
        brand: item.brand,
        model: item.model,
        color: item.color,
        description: item.description,
        photos: item.photos,
        location_address: item.locationAddress,
        latitude: item.coordinates.lat,
        longitude: item.coordinates.lng,
        date_reported: item.dateReported,
        incident_date: item.incidentDate,
        shipping_address: item.shippingAddress,
        secret_verification_hint: item.secretVerificationHint,
        status: item.status,
        created_at: item.createdAt
      })
      if (error) console.error('Supabase item insert error:', error)
    } catch (e) {
      console.warn('Supabase sync error:', e)
    }
  }

  // Always update local cache
  const items = getLocalItems()
  const updated = [item, ...items.filter(i => i.id !== item.id)]
  saveLocalItems(updated)
  return item
}

export async function updateItemStatus(itemId: string, status: Item['status'], matchedWithId?: string): Promise<void> {
  const client = getSupabase()
  if (client) {
    try {
      const updatePayload: Record<string, any> = { status }
      if (matchedWithId) updatePayload.matched_with_id = matchedWithId
      await client.from('items').update(updatePayload).eq('id', itemId)
    } catch (e) {
      console.warn('Supabase item update error:', e)
    }
  }

  const items = getLocalItems()
  const updated = items.map(it => {
    if (it.id === itemId) {
      return { ...it, status, ...(matchedWithId ? { matchedWithId } : {}) }
    }
    return it
  })
  saveLocalItems(updated)
}

export async function fetchAllDeliveries(): Promise<DeliveryJob[]> {
  const client = getSupabase()
  if (client) {
    try {
      const { data, error } = await client.from('deliveries').select('*').order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        return data.map(d => ({
          id: d.id,
          matchId: d.match_id,
          lostItemId: d.lost_item_id,
          foundItemId: d.found_item_id,
          courierId: d.courier_id,
          courierName: d.courier_name,
          courierPhone: d.courier_phone,
          courierVehicle: d.courier_vehicle,
          pickupAddress: d.pickup_address,
          pickupCoords: { lat: Number(d.pickup_lat), lng: Number(d.pickup_lng) },
          finderName: d.finder_name,
          finderPhone: d.finder_phone,
          deliveryAddress: d.delivery_address,
          deliveryCoords: { lat: Number(d.delivery_lat), lng: Number(d.delivery_lng) },
          ownerName: d.owner_name,
          ownerPhone: d.owner_phone,
          distanceKm: Number(d.distance_km),
          courierPayout: Number(d.courier_payout),
          platformFee: Number(d.platform_fee),
          totalCharged: Number(d.total_charged),
          discountApplied: Number(d.discount_applied || 0),
          pickupOtp: d.pickup_otp,
          deliveryOtp: d.delivery_otp,
          status: d.status,
          createdAt: d.created_at,
          deliveredAt: d.delivered_at
        }))
      }
    } catch (e) {
      console.warn('Supabase delivery fetch error:', e)
    }
  }
  return getLocalDeliveries()
}

export async function createDeliveryJob(job: DeliveryJob): Promise<DeliveryJob> {
  const client = getSupabase()
  if (client) {
    try {
      await client.from('deliveries').insert({
        id: job.id,
        match_id: job.matchId,
        lost_item_id: job.lostItemId,
        found_item_id: job.foundItemId,
        pickup_address: job.pickupAddress,
        pickup_lat: job.pickupCoords.lat,
        pickup_lng: job.pickupCoords.lng,
        finder_name: job.finderName,
        finder_phone: job.finderPhone,
        delivery_address: job.deliveryAddress,
        delivery_lat: job.deliveryCoords.lat,
        delivery_lng: job.deliveryCoords.lng,
        owner_name: job.ownerName,
        owner_phone: job.ownerPhone,
        distance_km: job.distanceKm,
        courier_payout: job.courierPayout,
        platform_fee: job.platformFee,
        total_charged: job.totalCharged,
        discount_applied: job.discountApplied,
        pickup_otp: job.pickupOtp,
        delivery_otp: job.deliveryOtp,
        status: job.status,
        created_at: job.createdAt
      })
    } catch (e) {
      console.warn('Supabase delivery insert error:', e)
    }
  }

  const jobs = getLocalDeliveries()
  const updated = [job, ...jobs.filter(j => j.id !== job.id)]
  saveLocalDeliveries(updated)
  return job
}

export async function updateDeliveryStatus(
  jobId: string, 
  status: DeliveryJob['status'], 
  courierData?: { id: string; name: string; phone: string; vehicle: 'bicycle' | 'motorcycle' | 'car' | 'van' }
): Promise<void> {
  const client = getSupabase()
  if (client) {
    try {
      const payload: Record<string, any> = { status }
      if (courierData) {
        payload.courier_id = courierData.id
        payload.courier_name = courierData.name
        payload.courier_phone = courierData.phone
        payload.courier_vehicle = courierData.vehicle
      }
      if (status === 'delivered') {
        payload.delivered_at = new Date().toISOString()
      }
      await client.from('deliveries').update(payload).eq('id', jobId)
    } catch (e) {
      console.warn('Supabase delivery update error:', e)
    }
  }

  const jobs = getLocalDeliveries()
  const updated = jobs.map(j => {
    if (j.id === jobId) {
      return {
        ...j,
        status,
        ...(courierData ? {
          courierId: courierData.id,
          courierName: courierData.name,
          courierPhone: courierData.phone,
          courierVehicle: courierData.vehicle
        } : {}),
        ...(status === 'delivered' ? { deliveredAt: new Date().toISOString() } : {})
      }
    }
    return j
  })
  saveLocalDeliveries(updated)
}

/**
 * Rewards a Finder with a 30% shipping discount voucher when their found item is reunited with its owner
 */
export function rewardFinderWithDiscount(finderEmailOrId: string): void {
  const users = getLocalUsers()
  const updated = users.map(u => {
    if (u.id === finderEmailOrId || u.email === finderEmailOrId) {
      return {
        ...u,
        finderDiscountTokens: (u.finderDiscountTokens || 0) + 1,
        successfulReunions: (u.successfulReunions || 0) + 1
      }
    }
    return u
  })
  saveLocalUsers(updated)
}

/**
 * Credits courier wallet with their delivery earnings
 */
export function creditCourierWallet(courierId: string, amount: number): void {
  const users = getLocalUsers()
  const updated = users.map(u => {
    if (u.id === courierId) {
      return {
        ...u,
        courierWalletBalance: Math.round(((u.courierWalletBalance || 0) + amount) * 100) / 100,
        courierDeliveriesCompleted: (u.courierDeliveriesCompleted || 0) + 1
      }
    }
    return u
  })
  saveLocalUsers(updated)
}

/**
 * Updates a courier's Aadhaar and biometric face verification data
 */
export function updateCourierKyc(courierId: string, kyc: Partial<UserProfile>): void {
  const users = getLocalUsers()
  const updated = users.map(u => {
    if (u.id === courierId) {
      return {
        ...u,
        ...kyc,
        verificationStatus: kyc.verificationStatus || 'pending'
      }
    }
    return u
  })
  saveLocalUsers(updated)
}

/**
 * Admin approves a delivery agent's Aadhaar and face recognition verification
 */
export function adminApproveCourier(courierId: string): void {
  const users = getLocalUsers()
  const updated = users.map(u => {
    if (u.id === courierId) {
      return {
        ...u,
        verificationStatus: 'verified' as const,
        verifiedAt: new Date().toISOString()
      }
    }
    return u
  })
  saveLocalUsers(updated)
}

/**
 * Admin rejects a delivery agent's Aadhaar or face verification
 */
export function adminRejectCourier(courierId: string, reason?: string): void {
  const users = getLocalUsers()
  const updated = users.map(u => {
    if (u.id === courierId) {
      return {
        ...u,
        verificationStatus: 'rejected' as const,
        verificationNotes: reason || 'Aadhaar / Biometric face match mismatch.'
      }
    }
    return u
  })
  saveLocalUsers(updated)
}

/**
 * Authenticate user with email and password
 */
export function authenticateUser(email: string, password?: string): UserProfile | null {
  const users = getLocalUsers()
  const cleanEmail = email.trim().toLowerCase()
  const found = users.find(u => u.email.toLowerCase() === cleanEmail)
  if (found) {
    if (!password || !found.password || found.password === password) {
      return found
    }
  }
  return null
}

/**
 * Register a new user profile
 */
export function registerUser(profile: UserProfile): UserProfile {
  const users = getLocalUsers()
  const cleanEmail = profile.email.trim().toLowerCase()
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail)
  if (existing) {
    return existing
  }
  const updated = [...users, profile]
  saveLocalUsers(updated)
  return profile
}

