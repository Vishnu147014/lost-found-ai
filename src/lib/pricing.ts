import { Coordinates, DeliveryPricing, ItemCategory } from '../types'

/**
 * Calculates straight-line distance in kilometers between two coordinates using the Haversine formula
 */
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  // Return rounded to 1 decimal place with a minimum of 1.0 km
  return Math.max(1.0, Math.round(distance * 10) / 10)
}

/**
 * Determines whether a category is considered high-value / fragile
 */
export function isHighValueCategory(category: ItemCategory): boolean {
  return ['smartphone', 'laptop', 'smartwatch', 'jewelry'].includes(category)
}

/**
 * Calculates full delivery pricing breakdown including courier payout, platform fee, and 30% discount
 */
export function calculateDeliveryPricing(
  distanceKm: number,
  category: ItemCategory,
  applyFinderDiscount: boolean = false
): DeliveryPricing {
  const baseCourierPayout = 6.00 // Base payout for courier ($/EUR/unit)
  const perKmRate = 1.25 // $1.25 per km traveled
  const distanceRate = Math.round(distanceKm * perKmRate * 100) / 100
  
  // Extra care insurance/handling bonus for expensive gadgets
  const highValueFee = isHighValueCategory(category) ? 4.00 : 0.00
  
  const totalCourierPayout = Math.round((baseCourierPayout + distanceRate + highValueFee) * 100) / 100
  
  // Platform maintenance & AI matching commission (approx 20% with $3.00 minimum)
  const platformCommission = Math.max(3.00, Math.round(totalCourierPayout * 0.22 * 100) / 100)
  
  const grossTotal = Math.round((totalCourierPayout + platformCommission) * 100) / 100
  
  let discountAmount = 0
  if (applyFinderDiscount) {
    // 30% discount reward for good Samaritans who previously found and returned items!
    discountAmount = Math.round(grossTotal * 0.30 * 100) / 100
  }
  
  const netTotalPayable = Math.max(1.00, Math.round((grossTotal - discountAmount) * 100) / 100)

  return {
    distanceKm,
    baseCourierPayout,
    distanceRate,
    highValueFee,
    totalCourierPayout,
    platformCommission,
    grossTotal,
    discountAmount,
    netTotalPayable,
    hasDiscountApplied: applyFinderDiscount && discountAmount > 0
  }
}
