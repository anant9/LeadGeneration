"use client"

import { useState } from "react"
import type { ExtractionFilter } from "@/lib/types"
import { useDashboard } from "@/lib/dashboard-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmationModal } from "@/components/confirmation-modal"
import {
  MapPin,
  Hash,
  Coins,
  Search,
  Globe,
  EyeOff,
  Play,
  Mail,
  Share2,
  MessageSquare,
  DollarSign,
} from "lucide-react"

interface FilterCardProps {
  filter: ExtractionFilter
}

export function FilterCard({ filter }: FilterCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const { extraction } = useDashboard()
  const isRunning = extraction.status === "loading"
  const isDone = extraction.status === "success"

  const fields = [
    { icon: Search, label: "Search Query", value: filter.searchQuery },
    { icon: MapPin, label: "Location", value: filter.locationQuery },
    { icon: Hash, label: "Max Results", value: filter.maxResults.toLocaleString() },
    { icon: Globe, label: "Language", value: filter.language.toUpperCase() },
    { icon: Globe, label: "Region", value: filter.region.toUpperCase() },
    { icon: EyeOff, label: "Skip Closed", value: filter.skipClosedPlaces ? "Yes" : "No" },
    { icon: Mail, label: "Scrape Emails", value: filter.scrapeEmails ? "Yes" : "No" },
    { icon: Share2, label: "Scrape Social", value: filter.scrapeSocialMedia ? "Yes" : "No" },
    { icon: MessageSquare, label: "Review Details", value: filter.scrapeReviewsDetail ? `Yes (max ${filter.maxReviews})` : "No" },
    { icon: DollarSign, label: "Cost Estimate", value: filter.costEstimate },
  ]

  return (
    <>
      <Card className="w-full border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Extraction Parameters
            </span>
            <Badge
              variant="secondary"
              className="gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              <Coins className="h-3 w-3" />~{filter.estimatedCredits} credits
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {fields.map((field) => (
              <div
                key={field.label}
                className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
              >
                <field.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground">
                    {field.label}
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {field.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!isDone && (
            <Button
              size="sm"
              className="mt-1 w-full gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setShowConfirm(true)}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Extracting...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  Confirm & Run Extraction
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <ConfirmationModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        filter={filter}
      />
    </>
  )
}
