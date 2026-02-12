"use client"

import { useEffect, useRef, useState } from "react"
import type { BusinessResult } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Star,
  Phone,
  Globe,
  Mail,
  MapPin,
  X,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MapViewProps {
  results: BusinessResult[]
}

function LeadDot({ score }: { score: string }) {
  const colors: Record<string, string> = {
    hot: "bg-red-500",
    warm: "bg-amber-500",
    cold: "bg-sky-500",
  }
  return <span className={cn("inline-block h-2 w-2 rounded-full", colors[score])} />
}

export function MapView({ results }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [selectedBiz, setSelectedBiz] = useState<BusinessResult | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Fix default marker icons
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      // Custom colored marker
      const createIcon = (score: string) => {
        const color = score === "hot" ? "#ef4444" : score === "warm" ? "#f59e0b" : "#3b82f6"
        return L.divIcon({
          html: `<div style="
            width: 28px; height: 28px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
          "><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          className: "",
        })
      }

      if (!mapRef.current) return

      // Calculate bounds from results
      const lats = results.map((r) => r.location.lat)
      const lngs = results.map((r) => r.location.lng)
      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
      const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length

      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      })

      // Use a dark tile layer that matches the app theme
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map)

      // Add attribution in a subtle way
      L.control
        .attribution({ prefix: false, position: "bottomright" })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" style="color: #666">OSM</a>')
        .addTo(map)

      // Add markers
      const markers: L.Marker[] = []
      for (const biz of results) {
        const marker = L.marker([biz.location.lat, biz.location.lng], {
          icon: createIcon(biz.leadScore),
          title: biz.title,
        })

        marker.on("click", () => {
          setSelectedBiz(biz)
        })

        marker.addTo(map)
        markers.push(marker)
      }

      markersRef.current = markers

      // Fit bounds
      if (results.length > 1) {
        const bounds = L.latLngBounds(results.map((r) => [r.location.lat, r.location.lng] as [number, number]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }

      mapInstance.current = map
      setMapReady(true)
    }

    initMap()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when results change
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default

      // Clear old markers
      for (const m of markersRef.current) m.remove()
      markersRef.current = []

      const createIcon = (score: string) => {
        const color = score === "hot" ? "#ef4444" : score === "warm" ? "#f59e0b" : "#3b82f6"
        return L.divIcon({
          html: `<div style="
            width: 28px; height: 28px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
          "><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          className: "",
        })
      }

      const markers: L.Marker[] = []
      for (const biz of results) {
        const marker = L.marker([biz.location.lat, biz.location.lng], {
          icon: createIcon(biz.leadScore),
          title: biz.title,
        })
        marker.on("click", () => setSelectedBiz(biz))
        marker.addTo(mapInstance.current!)
        markers.push(marker)
      }
      markersRef.current = markers

      if (results.length > 1) {
        const bounds = L.latLngBounds(results.map((r) => [r.location.lat, r.location.lng] as [number, number]))
        mapInstance.current!.fitBounds(bounds, { padding: [40, 40] })
      }
    }

    updateMarkers()
  }, [results, mapReady])

  return (
    <div className="relative h-full w-full">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* Map container */}
      <div ref={mapRef} className="h-full w-full" />

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-border/50 bg-card/90 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Hot Lead</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Warm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-sky-500" />
            <span className="text-muted-foreground">Cold</span>
          </div>
        </div>
      </div>

      {/* Results count overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 rounded-xl border border-border/50 bg-card/90 px-3 py-2 backdrop-blur-sm">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">{results.length} locations plotted</span>
      </div>

      {/* Selected business card */}
      {selectedBiz && (
        <div className="absolute right-4 top-4 z-[1000] w-80 rounded-xl border border-border/50 bg-card/95 shadow-xl backdrop-blur-sm">
          <div className="flex items-start justify-between border-b border-border/50 px-4 py-3">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{selectedBiz.title}</h3>
                <LeadDot score={selectedBiz.leadScore} />
              </div>
              <p className="text-xs text-muted-foreground">{selectedBiz.categoryName}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setSelectedBiz(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-2.5 px-4 py-3">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{selectedBiz.totalScore.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({selectedBiz.reviewsCount.toLocaleString()} reviews)</span>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{selectedBiz.address}</span>
            </div>

            {/* Phone */}
            {selectedBiz.phone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3 shrink-0" />
                <span>{selectedBiz.phone}</span>
              </div>
            )}

            {/* Email */}
            {selectedBiz.emails.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" />
                <span>{selectedBiz.emails[0]}</span>
              </div>
            )}

            {/* Website */}
            {selectedBiz.website && (
              <a
                href={selectedBiz.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:underline"
              >
                <Globe className="h-3 w-3 shrink-0" />
                {selectedBiz.website.replace(/^https?:\/\/(www\.)?/, "").slice(0, 35)}
              </a>
            )}

            {/* Price & Status */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {selectedBiz.price && (
                <Badge variant="secondary" className="text-[10px]">{selectedBiz.price}</Badge>
              )}
              {selectedBiz.permanentlyClosed ? (
                <Badge variant="destructive" className="text-[10px]">Closed</Badge>
              ) : (
                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400">Open</Badge>
              )}
              <Badge variant="outline" className={cn(
                "text-[10px] capitalize",
                selectedBiz.leadScore === "hot" ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
                : selectedBiz.leadScore === "warm" ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400"
              )}>
                {selectedBiz.leadScore} lead
              </Badge>
            </div>

            {/* Google Maps link */}
            <a
              href={selectedBiz.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
              View on Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
