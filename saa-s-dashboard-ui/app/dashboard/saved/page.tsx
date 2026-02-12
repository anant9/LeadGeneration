"use client"

import { useDashboard } from "@/lib/dashboard-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bookmark,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Hash,
  Play,
  Trash2,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function SavedSearchesPage() {
  const { savedSearches } = useDashboard()

  const handleRerun = (name: string) => {
    toast.info("Re-running extraction", {
      description: `Starting extraction for "${name}"...`,
    })
  }

  const handleDelete = (name: string) => {
    toast.success("Search deleted", {
      description: `"${name}" has been removed from saved searches.`,
    })
  }

  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="border-b border-border/50 px-6 py-5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold text-foreground">Saved Searches</h1>
            <p className="text-sm text-muted-foreground">
              View and re-run your previously saved extraction queries.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-6">
        {savedSearches.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <Bookmark className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-semibold text-foreground">No saved searches</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Run an extraction and click "Save Search" to save it here for later.
              </p>
            </div>
            <Link href="/dashboard">
              <Button size="sm" className="mt-2 gap-2 rounded-xl">
                <Search className="h-3.5 w-3.5" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="border-border/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Bookmark className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{savedSearches.length}</span>
                    <span className="text-xs text-muted-foreground">Total Saved</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Hash className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">
                      {savedSearches.reduce((sum, s) => sum + s.resultsCount, 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">Total Results Extracted</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">
                      ${savedSearches.reduce((sum, s) => sum + s.costAmount, 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">Total Spent</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search Name</TableHead>
                    <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Query</TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Results</TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cost</TableHead>
                    <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Date</TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedSearches.map((search) => (
                    <TableRow key={search.id} className="border-border/30 transition-colors hover:bg-muted/40">
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground">{search.name}</span>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {search.filters.locationQuery}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-[250px] md:table-cell">
                        <span className="line-clamp-2 text-xs text-muted-foreground">{search.query}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-sm font-medium text-foreground">{search.resultsCount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono text-sm text-muted-foreground">${search.costAmount.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {search.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {search.status === "completed" ? (
                          <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400">
                            Completed
                          </Badge>
                        ) : search.status === "running" ? (
                          <Badge variant="outline" className="rounded-md border-amber-500/20 bg-amber-500/10 text-[11px] text-amber-600 dark:text-amber-400">
                            Running
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="rounded-md text-[11px]">
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-primary hover:bg-primary/10"
                            onClick={() => handleRerun(search.name)}
                            title="Re-run extraction"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(search.name)}
                            title="Delete search"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
