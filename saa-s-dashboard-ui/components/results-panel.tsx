"use client"

import { useState } from "react"
import { useDashboard } from "@/lib/dashboard-context"
import { DataTable } from "@/components/data-table"
import { MapView } from "@/components/map-view"
import { ResultsSkeleton } from "@/components/results-skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson2,
  AlertCircle,
  Coins,
  DollarSign,
  Link2,
  CheckCircle2,
  Bookmark,
  BrainCircuit,
  Sparkles,
  TableIcon,
  MapIcon,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CRM_CONNECTORS = [
  { id: "salesforce", name: "Salesforce", icon: "SF", color: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30" },
  { id: "hubspot", name: "HubSpot", icon: "HS", color: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  { id: "zoho", name: "Zoho CRM", icon: "ZO", color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" },
  { id: "pipedrive", name: "Pipedrive", icon: "PD", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { id: "close", name: "Close CRM", icon: "CL", color: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30" },
]

type ViewMode = "table" | "map"

export function ResultsPanel() {
  const { extraction, onSaveSearch } = useDashboard()
  const [page, setPage] = useState(1)
  const [crmDialogOpen, setCrmDialogOpen] = useState(false)
  const [selectedCrm, setSelectedCrm] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const pageSize = 10

  const handleExport = (format: string) => {
    toast.success("Export started", {
      description: `Your ${format.toUpperCase()} file with ${extraction.totalResults} results will be ready shortly.`,
    })
  }

  const handleCrmConnect = (crmId: string) => {
    setSelectedCrm(crmId)
    setCrmDialogOpen(true)
  }

  const handleCrmSync = () => {
    const crm = CRM_CONNECTORS.find((c) => c.id === selectedCrm)
    toast.success(`Syncing to ${crm?.name}`, {
      description: `Pushing ${extraction.totalResults} leads to ${crm?.name}...`,
    })
    setCrmDialogOpen(false)
    setSelectedCrm(null)
  }

  const handleSaveQuery = () => {
    onSaveSearch()
    toast.success("Search saved", { description: "You can find it under Saved Searches." })
  }

  if (extraction.status === "idle") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/10 bg-primary/5">
            <BrainCircuit className="h-10 w-10 text-primary/40" />
          </div>
          <div className="absolute -inset-4 rounded-3xl bg-primary/[0.03] blur-2xl" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="flex items-center justify-center gap-2 text-base font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Agent Awaiting Query
          </h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Describe what businesses you need in the chat panel. The AI agent will parse
            your intent, configure extraction, and deliver enriched results here.
          </p>
        </div>
      </div>
    )
  }

  if (extraction.status === "loading") {
    return <ResultsSkeleton />
  }

  if (extraction.status === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-base font-semibold text-foreground">Extraction failed</h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {extraction.errorMessage || "Something went wrong. Please try again."}
          </p>
        </div>
        <Button variant="outline" size="sm" className="mt-2 rounded-xl bg-transparent">
          Try Again
        </Button>
      </div>
    )
  }

  const selectedCrmData = CRM_CONNECTORS.find((c) => c.id === selectedCrm)

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-border/50 bg-muted/30 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                viewMode === "map"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MapIcon className="h-3.5 w-3.5" />
              Map
            </button>
          </div>

          <Badge variant="secondary" className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {extraction.totalResults} places
          </Badge>
          <Badge variant="secondary" className="gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            <Coins className="h-3 w-3" />
            {extraction.creditsUsed} credits
          </Badge>
          <Badge variant="secondary" className="hidden gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground sm:flex">
            <DollarSign className="h-3 w-3" />
            ${extraction.costAmount.toFixed(2)}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Search */}
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl bg-transparent text-xs" onClick={handleSaveQuery}>
            <Bookmark className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl bg-transparent text-xs">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuLabel className="text-xs text-muted-foreground">File Formats</DropdownMenuLabel>
              <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => handleExport("csv")}>
                <FileText className="h-4 w-4" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => handleExport("json")}>
                <FileJson2 className="h-4 w-4" /> JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* CRM Connectors */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5 rounded-xl text-xs">
                <Link2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Push to CRM</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuLabel className="text-xs text-muted-foreground">CRM Connectors</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CRM_CONNECTORS.map((crm) => (
                <DropdownMenuItem key={crm.id} className="gap-3 rounded-lg" onClick={() => handleCrmConnect(crm.id)}>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-md border text-[10px] font-bold ${crm.color}`}>
                    {crm.icon}
                  </span>
                  <span>{crm.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content area - Table or Map */}
      {viewMode === "table" ? (
        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          <DataTable results={extraction.results} page={page} pageSize={pageSize} onPageChange={setPage} />
        </div>
      ) : (
        <div className="flex-1">
          <MapView results={extraction.results} />
        </div>
      )}

      {/* CRM Sync Dialog */}
      <Dialog open={crmDialogOpen} onOpenChange={setCrmDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCrmData && (
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold ${selectedCrmData.color}`}>
                  {selectedCrmData.icon}
                </span>
              )}
              Push to {selectedCrmData?.name}
            </DialogTitle>
            <DialogDescription>
              This will create {extraction.totalResults} new lead records in your {selectedCrmData?.name} account with all extracted business data including contact info, location, reviews, and social links.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Leads to sync</span>
                  <span className="font-medium">{extraction.totalResults}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fields per lead</span>
                  <span className="font-medium">30+ fields</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Includes emails</span>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Includes phone</span>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Includes social profiles</span>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl bg-transparent" onClick={() => setCrmDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 rounded-xl" onClick={handleCrmSync}>
                Sync Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
