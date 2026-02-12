"use client"

import type { ExtractionFilter } from "@/lib/types"
import { useDashboard } from "@/lib/dashboard-context"
import { useAuth } from "@/lib/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Coins, AlertTriangle, Zap, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filter: ExtractionFilter
}

export function ConfirmationModal({
  open,
  onOpenChange,
  filter,
}: ConfirmationModalProps) {
  const { confirmExtraction } = useDashboard()
  const { user } = useAuth()

  const hasEnoughCredits = (user?.credits ?? 0) >= filter.estimatedCredits

  const handleConfirm = () => {
    if (!hasEnoughCredits) {
      toast.error("Insufficient credits", {
        description: "Please upgrade your plan or purchase more credits.",
      })
      return
    }
    onOpenChange(false)
    confirmExtraction(filter)
    toast.info("Extraction started", {
      description: "Processing your request. Results will appear shortly.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            Confirm Extraction
          </DialogTitle>
          <DialogDescription className="text-center">
            Review the cost and parameters before running.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Search Query</span>
            <span className="max-w-[180px] truncate font-medium text-foreground">
              {filter.searchQuery}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="max-w-[180px] truncate font-medium text-foreground">
              {filter.locationQuery}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Max Results</span>
            <span className="font-medium text-foreground">
              {filter.maxResults.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Skip Closed Places</span>
            <span className="font-medium text-foreground">
              {filter.skipClosedPlaces ? "Yes" : "No"}
            </span>
          </div>

          <div className="my-1 h-px bg-border" />

          <div className="flex flex-col gap-1.5">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Data included per result
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {[
                "Name, Address, Phone",
                "Website & Emails",
                "Rating & Reviews",
                "Opening Hours",
                "Coordinates & Place ID",
                "Categories & Price",
                "Social Media Profiles",
                "Claim & Closure Status",
              ].map((field) => (
                <div key={field} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-primary/60" />
                  {field}
                </div>
              ))}
            </div>
          </div>

          <div className="my-1 h-px bg-border" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              Estimated Cost
            </div>
            <span className="text-lg font-semibold text-primary">
              {filter.costEstimate}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rate</span>
            <span className="text-xs text-muted-foreground">
              $10.00 per 1,000 results
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Balance</span>
            <span className="font-medium text-foreground">
              {user?.credits.toLocaleString()} credits
            </span>
          </div>
        </div>

        {!hasEnoughCredits && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              {"You don't have enough credits. Upgrade your plan to continue."}
            </span>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="rounded-xl bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleConfirm}
            disabled={!hasEnoughCredits}
          >
            <Zap className="h-4 w-4" />
            Run Extraction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
