"use client"

import { useState } from "react"
import type { BusinessResult } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  Mail,
  Globe,
  Phone,
  MapPin,
  Clock,
  Hash,
  Share2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableProps {
  results: BusinessResult[]
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

function LeadBadge({ score }: { score: string }) {
  const styles: Record<string, string> = {
    hot: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
    warm: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    cold: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20",
  }
  return (
    <Badge variant="outline" className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium capitalize", styles[score])}>
      {score}
    </Badge>
  )
}

function RatingStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="font-medium">{score.toFixed(1)}</span>
    </div>
  )
}

function StatusBadge({ closed, tempClosed }: { closed: boolean; tempClosed: boolean }) {
  if (closed) return <Badge variant="destructive" className="rounded-md text-[11px]">Permanently Closed</Badge>
  if (tempClosed) return <Badge variant="outline" className="rounded-md border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-600 dark:text-amber-400">Temp Closed</Badge>
  return <Badge variant="outline" className="rounded-md border-emerald-500/20 bg-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400">Open</Badge>
}

function ExpandedRow({ biz }: { biz: BusinessResult }) {
  return (
    <TableRow className="border-border/20 bg-muted/20 hover:bg-muted/20">
      <TableCell colSpan={10} className="p-0">
        <div className="grid grid-cols-1 gap-6 px-6 py-5 md:grid-cols-3">
          {/* Column 1: Location & Contact */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> Location & Contact
            </h4>
            <div className="space-y-1.5 text-sm">
              <p><span className="text-muted-foreground">Street:</span> {biz.street}</p>
              <p><span className="text-muted-foreground">Neighborhood:</span> {biz.neighborhood}</p>
              <p><span className="text-muted-foreground">City:</span> {biz.city}, {biz.state} {biz.postalCode}</p>
              <p><span className="text-muted-foreground">Country:</span> {biz.countryCode}</p>
              {biz.plusCode && <p><span className="text-muted-foreground">Plus Code:</span> {biz.plusCode}</p>}
              <p><span className="text-muted-foreground">Coords:</span> {biz.location.lat.toFixed(4)}, {biz.location.lng.toFixed(4)}</p>
              {biz.phone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {biz.phone}
                </p>
              )}
              {biz.emails.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <Mail className="mt-0.5 h-3 w-3 text-muted-foreground" />
                  <div>{biz.emails.map((e, i) => <span key={e}>{i > 0 ? ", " : ""}{e}</span>)}</div>
                </div>
              )}
              {biz.website && (
                <a href={biz.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                  <Globe className="h-3 w-3" /> {biz.website.replace(/^https?:\/\/(www\.)?/, "").slice(0, 35)}
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Business Details */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Hash className="h-3.5 w-3.5" /> Business Details
            </h4>
            <div className="space-y-1.5 text-sm">
              {biz.subtitle && <p><span className="text-muted-foreground">Subtitle:</span> {biz.subtitle}</p>}
              <p><span className="text-muted-foreground">Place ID:</span> <span className="font-mono text-xs">{biz.placeId}</span></p>
              <p><span className="text-muted-foreground">CID:</span> <span className="font-mono text-xs">{biz.cid}</span></p>
              <p><span className="text-muted-foreground">Claim Status:</span> {biz.claimStatus}</p>
              {biz.price && <p><span className="text-muted-foreground">Price Level:</span> {biz.price}</p>}
              {biz.isAdvertisement && <Badge variant="outline" className="border-amber-500/30 text-[10px] text-amber-500">Ad</Badge>}
              {biz.description && <p className="pt-1 text-xs leading-relaxed text-muted-foreground">{biz.description}</p>}
              <div className="flex flex-wrap gap-1 pt-1">
                {biz.categories.map((c) => (
                  <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                ))}
              </div>
              {biz.menu && (
                <a href={biz.menu} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 pt-1 text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> View Menu
                </a>
              )}
              {biz.reservationLinks.length > 0 && (
                <a href={biz.reservationLinks[0]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> Reserve
                </a>
              )}
              {biz.orderLinks.length > 0 && (
                <a href={biz.orderLinks[0]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> Order Online
                </a>
              )}
            </div>
          </div>

          {/* Column 3: Reviews, Hours, Social */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Star className="h-3.5 w-3.5" /> Review Distribution
            </h4>
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              {([5, 4, 3, 2, 1] as const).map((s) => {
                const key = (["fiveStar", "fourStar", "threeStar", "twoStar", "oneStar"] as const)[5 - s]
                const count = biz.reviewsDistribution[key]
                const pct = biz.reviewsCount > 0 ? (count / biz.reviewsCount) * 100 : 0
                return (
                  <div key={s} className="flex flex-col items-center gap-0.5">
                    <span className="text-muted-foreground">{s}{"*"}</span>
                    <div className="flex h-14 w-full items-end overflow-hidden rounded-sm bg-muted/50">
                      <div className="w-full rounded-sm bg-amber-400/60 transition-all" style={{ height: `${Math.max(pct, 2)}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{count.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>

            <h4 className="flex items-center gap-1.5 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Hours
            </h4>
            <div className="space-y-0.5 text-xs">
              {biz.openingHours.slice(0, 7).map((oh) => (
                <div key={oh.day} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{oh.day.slice(0, 3)}</span>
                  <span className={oh.hours === "Closed" ? "text-red-400" : "text-foreground"}>{oh.hours}</span>
                </div>
              ))}
            </div>

            {biz.socialMedia.length > 0 && (
              <>
                <h4 className="flex items-center gap-1.5 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Share2 className="h-3.5 w-3.5" /> Social
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {biz.socialMedia.map((sm) => (
                    <a key={sm.url} href={sm.url} target="_blank" rel="noopener noreferrer">
                      <Badge variant="secondary" className="cursor-pointer text-[10px] transition-colors hover:bg-primary/20 hover:text-primary">{sm.platform}</Badge>
                    </a>
                  ))}
                </div>
              </>
            )}

            {Object.keys(biz.additionalInfo).length > 0 && (
              <div className="space-y-1 pt-2 text-xs">
                {Object.entries(biz.additionalInfo).map(([key, vals]) => (
                  <p key={key}><span className="text-muted-foreground">{key}:</span> {vals.join(", ")}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function DataTable({ results, page, pageSize, onPageChange }: DataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const totalPages = Math.ceil(results.length / pageSize)
  const paginatedData = results.slice((page - 1) * pageSize, page * pageSize)

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-8" />
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rating</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reviews</TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Address</TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Phone</TableHead>
              <TableHead className="hidden text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">Price</TableHead>
              <TableHead className="hidden text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Status</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lead</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((biz) => {
              const expanded = expandedRows.has(biz.id)
              return (
                <>{/* row pair */}
                  <TableRow
                    key={biz.id}
                    className="cursor-pointer border-border/30 transition-colors hover:bg-muted/40"
                    onClick={() => toggleRow(biz.id)}
                  >
                    <TableCell className="w-8 px-2">
                      {expanded
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{biz.title}</span>
                        {biz.website && (
                          <a
                            href={biz.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="h-3 w-3" />
                            {biz.website.replace(/^https?:\/\/(www\.)?/, "").slice(0, 28)}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><span className="text-xs text-muted-foreground">{biz.categoryName}</span></TableCell>
                    <TableCell className="text-center"><RatingStars score={biz.totalScore} /></TableCell>
                    <TableCell className="text-center font-mono text-sm text-muted-foreground">{biz.reviewsCount.toLocaleString()}</TableCell>
                    <TableCell className="hidden max-w-[200px] lg:table-cell">
                      <div className="flex flex-col gap-0.5">
                        <span className="truncate text-xs text-muted-foreground">{biz.address}</span>
                        <span className="text-[11px] text-muted-foreground/60">{biz.neighborhood}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {biz.phone ? (
                        <span className="font-mono text-xs text-muted-foreground">{biz.phone}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">--</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-center sm:table-cell">
                      <span className="text-xs font-medium text-muted-foreground">{biz.price || "--"}</span>
                    </TableCell>
                    <TableCell className="hidden text-center md:table-cell">
                      <StatusBadge closed={biz.permanentlyClosed} tempClosed={biz.temporarilyClosed} />
                    </TableCell>
                    <TableCell className="text-center"><LeadBadge score={biz.leadScore} /></TableCell>
                  </TableRow>
                  {expanded && <ExpandedRow key={`${biz.id}-exp`} biz={biz} />}
                </>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1}--{Math.min(page * pageSize, results.length)} of {results.length}
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="rounded-lg bg-transparent" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => onPageChange(p)}>
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="rounded-lg bg-transparent" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
