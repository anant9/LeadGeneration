"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react"
import type {
  ChatMessage,
  ExtractionRun,
  ExtractionFilter,
  SavedSearch,
  BusinessResult,
} from "./types"
import {
  PRICE_PER_RESULT,
  estimateCost,
  mockSavedSearches,
} from "./mock-data"
import { chatWithAgent, searchBusinesses } from "./api"

interface DashboardContextType {
  messages: ChatMessage[]
  extraction: ExtractionRun
  isTyping: boolean
  showConfirmation: boolean
  pendingFilter: ExtractionFilter | null
  savedSearches: SavedSearch[]
  sendMessage: (content: string) => void
  confirmExtraction: (filter?: ExtractionFilter) => void
  cancelExtraction: () => void
  openConfirmation: () => void
  onSaveSearch: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
)

const initialExtraction: ExtractionRun = {
  id: "",
  totalResults: 0,
  creditsUsed: 0,
  costAmount: 0,
  results: [],
  status: "idle",
}

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to ExtractAI! Tell me what businesses you want to extract from Google Maps. For example:\n\n- \"Find top 50 restaurants in New York with 4+ star rating\"\n- \"Coffee shops in San Francisco\"\n- \"Dentists in Chicago with 200+ reviews\"\n\nI'll parse your query into extraction parameters and fetch the complete dataset. You can filter, export, or push results to your CRM afterwards.",
  timestamp: new Date(),
}

export function DashboardProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG])
  const [extraction, setExtraction] = useState<ExtractionRun>(initialExtraction)
  const [isTyping, setIsTyping] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingFilter, setPendingFilter] = useState<ExtractionFilter | null>(null)
  const [pendingQueryText, setPendingQueryText] = useState<string | null>(null)
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(mockSavedSearches)
  const idCounter = useRef(0)

  const genId = () => {
    idCounter.current += 1
    return `msg_${idCounter.current}_${Date.now()}`
  }

  const mapSearchResults = useCallback((results: Awaited<ReturnType<typeof searchBusinesses>>["results"]): BusinessResult[] => {
    return results.map((biz, index) => {
      const rating = biz.rating ?? 0
      const reviews = biz.user_ratings_total ?? 0
      const leadScore = rating >= 4.5 && reviews >= 50 ? "hot" : rating >= 4.0 ? "warm" : "cold"

      const openingHours = (biz.opening_hours?.weekday_text || []).map((line) => {
        const [day, ...rest] = line.split(":")
        return {
          day: day.trim(),
          hours: rest.join(":").trim() || "",
        }
      })

      return {
        id: biz.place_id || `biz_${index}`,
        title: biz.name || "Unknown",
        subtitle: biz.primary_type || null,
        categoryName: biz.primary_type || biz.types?.[0] || "Business",
        categories: biz.types || [],
        address: biz.formatted_address || "",
        neighborhood: "",
        street: "",
        city: biz.city || "",
        postalCode: biz.postal_code || "",
        state: biz.state || "",
        countryCode: biz.country || "",
        phone: biz.international_phone_number || biz.formatted_phone_number || null,
        website: biz.website || null,
        url: biz.google_maps_url || "",
        totalScore: rating,
        reviewsCount: reviews,
        reviewsDistribution: {
          oneStar: 0,
          twoStar: 0,
          threeStar: 0,
          fourStar: 0,
          fiveStar: 0,
        },
        imageUrl: biz.photos?.[0] || null,
        location: { lat: biz.latitude, lng: biz.longitude },
        placeId: biz.place_id || "",
        cid: "",
        permanentlyClosed: (biz.business_status || "").toLowerCase().includes("permanently"),
        temporarilyClosed: (biz.business_status || "").toLowerCase().includes("temporarily"),
        openingHours,
        plusCode: null,
        price: biz.price_level || null,
        menu: null,
        description: null,
        additionalInfo: {},
        reservationLinks: [],
        orderLinks: [],
        emails: [],
        socialMedia: [],
        claimStatus: "Unknown",
        isAdvertisement: false,
        leadScore,
      }
    })
  }, [])

  const openConfirmation = useCallback(() => {
    setShowConfirmation(true)
  }, [])

  const confirmExtraction = useCallback(async (filterArg?: ExtractionFilter) => {
    const activeFilter = filterArg || pendingFilter
    if (!activeFilter) return
    setShowConfirmation(false)

    setExtraction({
      id: `ext_${Date.now()}`,
      totalResults: 0,
      creditsUsed: 0,
      costAmount: 0,
      results: [],
      status: "loading",
    })

    const loadMsg: ChatMessage = {
      id: genId(),
      role: "assistant",
      content: `Extraction started! Fetching up to ${activeFilter.maxResults} results for "${activeFilter.searchQuery}" in "${activeFilter.locationQuery}"...\n\nScraping emails, social profiles, opening hours, reviews distribution, and all available data fields. This may take a moment.`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, loadMsg])

    try {
      const naturalQuery = pendingQueryText
        || `${activeFilter.searchQuery} in ${activeFilter.locationQuery}`
      const response = await searchBusinesses(naturalQuery, activeFilter.maxResults)
      const results = mapSearchResults(response.results)
      const count = results.length
      const cost = count * PRICE_PER_RESULT

      setExtraction({
        id: `ext_${Date.now()}`,
        totalResults: count,
        creditsUsed: count,
        costAmount: cost,
        results,
        status: "success",
      })

      const doneMsg: ChatMessage = {
        id: genId(),
        role: "assistant",
        content: `Extraction complete! Found **${count} businesses** with full data.\n\n**Cost:** $${cost.toFixed(2)} (${count} results x $${PRICE_PER_RESULT.toFixed(3)}/result)\n\nEach result includes: name, category, address, coordinates, phone, website, rating, review count, opening hours, and more.\n\nYou can now:\n- **Export** as CSV, Excel, or JSON\n- **Push to CRM** (Salesforce, HubSpot, Zoho, Pipedrive, Close)\n- **Save this search** to run again later\n- **Click any row** to expand details`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, doneMsg])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch results"
      setExtraction({
        id: `ext_${Date.now()}`,
        totalResults: 0,
        creditsUsed: 0,
        costAmount: 0,
        results: [],
        status: "error",
        errorMessage: message,
      })

      const errorMsg: ChatMessage = {
        id: genId(),
        role: "assistant",
        content: `Extraction failed: ${message}. Please try again in a moment.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    }
  }, [pendingFilter, pendingQueryText, mapSearchResults])

  const sendMessage = useCallback(async (content: string) => {
    const normalized = content.trim().toLowerCase()
    const isConfirm = ["go ahead", "confirm", "run", "start", "yes", "ok", "okay"].includes(normalized)
    if (isConfirm && pendingFilter) {
      setIsTyping(false)
      await confirmExtraction(pendingFilter)
      return
    }

    const userMsg: ChatMessage = {
      id: genId(),
      role: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    const greetingLike = ["hi", "hello", "hey", "thanks", "thank you"].includes(normalized)
    const locationOnly = /^(in|near|around|at)\b/.test(normalized)
    const minLength = 6
    const isSearchLike = normalized.length >= minLength && !greetingLike && !locationOnly

    if (!isSearchLike) {
      try {
        const history = [...messages, userMsg].map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
        const response = await chatWithAgent(content, history)
        const normalizedFilter = response.filter
          ? {
              ...response.filter,
              scrapeReviewsDetail:
                response.filter.scrapeReviewsDetail && response.filter.maxReviews > 0,
              maxReviews:
                response.filter.scrapeReviewsDetail && response.filter.maxReviews > 0
                  ? response.filter.maxReviews
                  : 0,
            }
          : undefined
        const aiContent = response.message
          || response.clarificationQuestion
          || "Got it."

        const aiMsg: ChatMessage = {
          id: genId(),
          role: "assistant",
          content: aiContent,
          timestamp: new Date(),
          filterCard: normalizedFilter,
        }

        setMessages((prev) => [...prev, aiMsg])
        setPendingFilter(normalizedFilter || null)
        setPendingQueryText(response.queryText || content)
        setIsTyping(false)

        if (normalizedFilter && !response.needsClarification) {
          await confirmExtraction(normalizedFilter)
        }
      } catch (error) {
        setIsTyping(false)
      }
      return
    }

    const defaultMaxResults = 5
    const directFilter: ExtractionFilter = {
      searchQuery: content.trim() || "Businesses",
      locationQuery: "As provided",
      maxResults: defaultMaxResults,
      language: "en",
      region: "us",
      skipClosedPlaces: true,
      scrapeEmails: true,
      scrapeSocialMedia: true,
      scrapeReviewsDetail: false,
      maxReviews: 0,
      estimatedCredits: defaultMaxResults,
      costEstimate: estimateCost(defaultMaxResults),
    }

    const aiMsg: ChatMessage = {
      id: genId(),
      role: "assistant",
      content: `Running search for: "${content.trim()}"`,
      timestamp: new Date(),
      filterCard: directFilter,
    }

    setMessages((prev) => [...prev, aiMsg])
    setPendingFilter(directFilter)
    setPendingQueryText(content)
    setIsTyping(false)
    await confirmExtraction(directFilter)
  }, [messages, pendingFilter, confirmExtraction])

  const cancelExtraction = useCallback(() => {
    setShowConfirmation(false)
    setPendingFilter(null)
    const msg: ChatMessage = {
      id: genId(),
      role: "assistant",
      content: "Extraction cancelled. Feel free to try a different query.",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, msg])
  }, [])

  const onSaveSearch = useCallback(() => {
    if (extraction.status !== "success") return
    const filter = pendingFilter || {
      searchQuery: "Custom search",
      locationQuery: "Unknown",
      maxResults: extraction.totalResults,
      language: "en",
      region: "us",
      skipClosedPlaces: true,
      scrapeEmails: true,
      scrapeSocialMedia: true,
      scrapeReviewsDetail: false,
      maxReviews: 0,
      estimatedCredits: extraction.creditsUsed,
      costEstimate: `$${extraction.costAmount.toFixed(2)}`,
    }
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")
    const saved: SavedSearch = {
      id: `ss-${Date.now()}`,
      name: `${filter.searchQuery} in ${filter.locationQuery}`,
      query: lastUserMsg?.content || filter.searchQuery,
      filters: filter,
      resultsCount: extraction.totalResults,
      creditsUsed: extraction.creditsUsed,
      costAmount: extraction.costAmount,
      createdAt: new Date(),
      status: "completed",
    }
    setSavedSearches((prev) => [saved, ...prev])
  }, [pendingFilter, extraction, messages])

  return (
    <DashboardContext.Provider
      value={{
        messages,
        extraction,
        isTyping,
        showConfirmation,
        pendingFilter,
        savedSearches,
        sendMessage,
        confirmExtraction,
        cancelExtraction,
        openConfirmation,
        onSaveSearch,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
