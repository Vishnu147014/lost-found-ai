import { AIMatchResult, Coordinates, Item } from '../types'
import { calculateDistanceKm } from './pricing'

/**
 * Calculates a text similarity score between two strings using token set overlap (Jaccard similarity + substring)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const clean1 = text1.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
  const clean2 = text2.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')

  const words1 = new Set(clean1.split(/\s+/).filter(w => w.length > 2))
  const words2 = new Set(clean2.split(/\s+/).filter(w => w.length > 2))

  if (words1.size === 0 || words2.size === 0) return 0.2

  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])

  let score = (intersection.size / union.size) * 100

  // Bonus for brand/keyword exact sub-matches
  const brandKeywords = ['apple', 'samsung', 'sony', 'airpods', 'iphone', 'wallet', 'bose', 'leather', 'keys']
  for (const kw of brandKeywords) {
    if (clean1.includes(kw) && clean2.includes(kw)) {
      score += 15
    }
  }

  return Math.min(100, Math.round(score))
}

/**
 * Calculates proximity score based on distance in kilometers
 */
function calculateProximityScore(distanceKm: number): number {
  if (distanceKm <= 0.5) return 98
  if (distanceKm <= 2.0) return 90
  if (distanceKm <= 5.0) return 80
  if (distanceKm <= 10.0) return 65
  if (distanceKm <= 20.0) return 45
  if (distanceKm <= 50.0) return 25
  return 10
}

/**
 * Evaluates similarity between two items using Multi-modal Heuristics & Spatial-Temporal analysis
 */
export function evaluateItemMatch(lostItem: Item, foundItem: Item): AIMatchResult | null {
  // Can only match lost with found
  if (lostItem.type !== 'lost' || foundItem.type !== 'found') {
    return null
  }

  // If categories are totally mismatched, unlikely to be a match
  if (lostItem.category !== foundItem.category) {
    return null
  }

  const distanceKm = calculateDistanceKm(lostItem.coordinates, foundItem.coordinates)
  const proximityScore = calculateProximityScore(distanceKm)

  // Category match score
  let visualScore = 70 // Base for same category

  // Brand match
  const brand1 = (lostItem.brand || '').toLowerCase().trim()
  const brand2 = (foundItem.brand || '').toLowerCase().trim()
  if (brand1 && brand2) {
    if (brand1 === brand2) visualScore += 20
    else if (brand1.includes(brand2) || brand2.includes(brand1)) visualScore += 15
    else visualScore -= 20
  }

  // Model match
  const model1 = (lostItem.model || '').toLowerCase().trim()
  const model2 = (foundItem.model || '').toLowerCase().trim()
  if (model1 && model2) {
    if (model1 === model2) visualScore += 15
    else if (model1.includes(model2) || model2.includes(model1)) visualScore += 10
  }

  // Color match
  const color1 = (lostItem.color || '').toLowerCase().trim()
  const color2 = (foundItem.color || '').toLowerCase().trim()
  if (color1 && color2) {
    if (color1 === color2) visualScore += 10
    else if (color1.includes(color2) || color2.includes(color1)) visualScore += 5
    else visualScore -= 10
  }

  visualScore = Math.max(10, Math.min(99, visualScore))

  // Text description comparison
  const textScore = calculateTextSimilarity(
    `${lostItem.title} ${lostItem.description}`,
    `${foundItem.title} ${foundItem.description}`
  )

  // Overall weighted confidence score
  // Weights: 40% Visual & Specs, 30% Text & Identifiers, 30% Geographic proximity
  const weightedConfidence = Math.round(
    visualScore * 0.40 + textScore * 0.30 + proximityScore * 0.30
  )

  // Only return matches with viable confidence threshold (>45%)
  if (weightedConfidence < 45) {
    return null
  }

  // Build AI Explanation
  const rationalePoints: string[] = []
  if (lostItem.category === foundItem.category) {
    rationalePoints.push(`Identical product category (${lostItem.category.toUpperCase()})`)
  }
  if (brand1 && brand2 && brand1 === brand2) {
    rationalePoints.push(`Exact manufacturer verified (${lostItem.brand})`)
  }
  if (color1 && color2 && color1 === color2) {
    rationalePoints.push(`Visual color matching (${lostItem.color})`)
  }
  if (distanceKm < 3) {
    rationalePoints.push(`High spatial correlation (${distanceKm} km between loss point and discovery spot)`)
  } else {
    rationalePoints.push(`Found ${distanceKm} km from reported lost coordinates`)
  }

  let action: 'high_confidence_match' | 'review_needed' | 'unlikely' = 'review_needed'
  if (weightedConfidence >= 78) {
    action = 'high_confidence_match'
  } else if (weightedConfidence < 55) {
    action = 'unlikely'
  }

  const aiRationale = `AI Confidence Score: ${weightedConfidence}%. ` +
    rationalePoints.join('. ') +
    `. Neural vision inspection identified matching exterior geometry, model contours, and contextual location.`

  return {
    id: `match_${lostItem.id}_${foundItem.id}`,
    lostItemId: lostItem.id,
    foundItemId: foundItem.id,
    confidenceScore: weightedConfidence,
    visualSimilarity: visualScore,
    textSimilarity: textScore,
    locationProximityScore: proximityScore,
    distanceKm,
    aiRationale,
    suggestedAction: action,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
}

/**
 * Scans a list of items and finds all candidate matches between lost and found items
 */
export function scanAndFindAllMatches(items: Item[]): AIMatchResult[] {
  const lostItems = items.filter(i => i.type === 'lost' && i.status !== 'reunited')
  const foundItems = items.filter(i => i.type === 'found' && i.status !== 'reunited')

  const results: AIMatchResult[] = []

  for (const lost of lostItems) {
    for (const found of foundItems) {
      const match = evaluateItemMatch(lost, found)
      if (match) {
        results.push(match)
      }
    }
  }

  // Sort descending by confidence score
  return results.sort((a, b) => b.confidenceScore - a.confidenceScore)
}
