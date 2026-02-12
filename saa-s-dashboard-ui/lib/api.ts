export interface BusinessResponse {
  name: string
  place_id: string
  types: string[]
  primary_type?: string
  business_status?: string
  google_maps_url?: string
  formatted_address?: string
  latitude: number
  longitude: number
  city?: string
  state?: string
  country?: string
  postal_code?: string
  formatted_phone_number?: string
  international_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  price_level?: string
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
  photos?: string[]
}

export interface SearchResultsResponse {
  total_results: number
  results: BusinessResponse[]
  query: Record<string, unknown>
}

export interface AgentHistoryMessage {
  role: "user" | "assistant"
  content: string
}

export interface AgentExtractionFilter {
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

export interface AgentChatResponse {
  message: string
  filter?: AgentExtractionFilter
  queryText?: string
  needsConfirmation: boolean
  needsClarification: boolean
  clarificationQuestion?: string
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export async function searchBusinesses(
  query: string,
  maxResults: number = 50,
): Promise<SearchResultsResponse> {
  const url = new URL("/api/v1/search/natural", API_BASE_URL)
  url.searchParams.set("query", query)
  url.searchParams.set("max_results", String(maxResults))

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with ${response.status}`)
  }

  return response.json()
}

export async function chatWithAgent(
  message: string,
  history: AgentHistoryMessage[] = [],
): Promise<AgentChatResponse> {
  const url = new URL("/api/v1/agent/chat", API_BASE_URL)
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      message,
      history,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with ${response.status}`)
  }

  return response.json()
}
