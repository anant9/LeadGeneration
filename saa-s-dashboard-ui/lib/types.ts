export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  credits: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  filterCard?: ExtractionFilter
}

export interface ExtractionFilter {
  searchQuery: string
  locationQuery: string
  maxResults: number
  language: string
  region: string
  skipClosedPlaces: boolean
  scrapeEmails: boolean
  scrapeSocialMedia: boolean
  scrapeReviewsDetail: boolean
  maxReviews: number
  estimatedCredits: number
  costEstimate: string
}

export interface BusinessResult {
  id: string
  title: string
  subtitle: string | null
  categoryName: string
  categories: string[]
  address: string
  neighborhood: string
  street: string
  city: string
  postalCode: string
  state: string
  countryCode: string
  phone: string | null
  website: string | null
  url: string
  totalScore: number
  reviewsCount: number
  reviewsDistribution: {
    oneStar: number
    twoStar: number
    threeStar: number
    fourStar: number
    fiveStar: number
  }
  imageUrl: string | null
  location: { lat: number; lng: number }
  placeId: string
  cid: string
  permanentlyClosed: boolean
  temporarilyClosed: boolean
  openingHours: { day: string; hours: string }[]
  plusCode: string | null
  price: string | null
  menu: string | null
  description: string | null
  additionalInfo: Record<string, string[]>
  reservationLinks: string[]
  orderLinks: string[]
  emails: string[]
  socialMedia: { platform: string; url: string }[]
  claimStatus: string
  isAdvertisement: boolean
  leadScore: "hot" | "warm" | "cold"
}

export interface ExtractionRun {
  id: string
  totalResults: number
  creditsUsed: number
  costAmount: number
  results: BusinessResult[]
  status: "idle" | "loading" | "success" | "error"
  errorMessage?: string
}

export interface SavedSearch {
  id: string
  name: string
  query: string
  filters: ExtractionFilter
  resultsCount: number
  creditsUsed: number
  costAmount: number
  createdAt: Date
  status: "completed" | "failed" | "running"
}

export interface BillingPlan {
  id: string
  name: string
  price: number
  resultsPerMonth: number
  pricePerResult: string
  features: string[]
  popular?: boolean
}

export interface Invoice {
  id: string
  date: Date
  amount: number
  resultsUsed: number
  status: "paid" | "pending" | "overdue"
  description: string
}
